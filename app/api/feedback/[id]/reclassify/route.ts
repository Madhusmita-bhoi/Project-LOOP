import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";
import { classifyFeedback } from "@/lib/ai";
import { generateEmbedding } from "@/lib/search";

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/feedback/[id]/reclassify: Re-run AI classification for an item
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN", "ANALYST"]);
    if (roleError) return roleError;

    // Fetch existing feedback belonging to workspace
    const feedback = await prisma.feedback.findFirst({
      where: { id: params.id, workspaceId },
      include: { themes: true },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    // Fetch workspace themes
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });

    const themeNames = existingThemes.map((t) => t.name);

    // Run AI classification
    const classification = await classifyFeedback(feedback.content, themeNames);

    // Update feedback record
    const updated = await prisma.feedback.update({
      where: { id: feedback.id },
      data: {
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,
        aiRationale: `[Re-classified] ${classification.rationale}`,
      },
    });

    // Remove old theme associations and recreate new ones
    await prisma.feedbackTheme.deleteMany({
      where: { feedbackId: feedback.id },
    });

    for (const themeName of classification.themes) {
      let themeRecord = existingThemes.find(
        (t) => t.name.toLowerCase() === themeName.toLowerCase()
      );

      if (!themeRecord) {
        themeRecord = await prisma.theme.create({
          data: {
            name: themeName,
            color: "#6366f1",
            workspaceId,
          },
        });
      }

      await prisma.feedbackTheme.create({
        data: {
          feedbackId: feedback.id,
          themeId: themeRecord.id,
          confidence: 0.95,
        },
      });
    }

    // Refresh embedding
    const vector = generateEmbedding(feedback.content);
    await prisma.embedding.upsert({
      where: { feedbackId: feedback.id },
      update: { vector: JSON.stringify(vector) },
      create: {
        feedbackId: feedback.id,
        vector: JSON.stringify(vector),
        workspaceId,
      },
    });

    const refreshed = await prisma.feedback.findUnique({
      where: { id: feedback.id },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Feedback re-classified successfully",
      data: refreshed,
    });
  } catch (error: any) {
    console.error("Re-classify error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to re-classify feedback" },
      { status: 500 }
    );
  }
}

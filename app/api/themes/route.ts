import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";
import { ThemeCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/themes: List workspace themes with feedback count, sentiment breakdown, and spike velocity
export async function GET(req: Request) {
  try {
    const { authenticated, workspaceId } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevPeriodStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        feedbacks: {
          include: {
            feedback: {
              select: {
                id: true,
                sentiment: true,
                sentimentScore: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const enrichedThemes = themes.map((theme: any) => {
      let currentPeriodCount = 0;
      let prevPeriodCount = 0;
      let posCount = 0;
      let neuCount = 0;
      let negCount = 0;
      let scoreSum = 0;

      for (const item of theme.feedbacks) {
        if (!item.feedback) continue;
        const itemDate = new Date(item.feedback.createdAt);
        
        if (itemDate >= periodStart && itemDate <= now) {
          currentPeriodCount++;
          if (item.feedback.sentiment === "POS") posCount++;
          else if (item.feedback.sentiment === "NEG") negCount++;
          else neuCount++;
          scoreSum += item.feedback.sentimentScore;
        } else if (itemDate >= prevPeriodStart && itemDate < periodStart) {
          prevPeriodCount++;
        }
      }

      // Calculate growth rate and spike flag
      let growthRate = 0;
      if (prevPeriodCount > 0) {
        growthRate = Math.round(((currentPeriodCount - prevPeriodCount) / prevPeriodCount) * 100);
      } else if (currentPeriodCount > 0) {
        growthRate = 100;
      }

      const isSpiking = growthRate >= 40 && currentPeriodCount >= 3;
      const totalCount = theme.feedbacks.length;
      const avgSentimentScore = currentPeriodCount > 0 ? Number((scoreSum / currentPeriodCount).toFixed(2)) : 0;

      return {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        color: theme.color,
        count: totalCount,
        recentCount: currentPeriodCount,
        prevPeriodCount,
        growthRate,
        isSpiking,
        avgSentimentScore,
        sentimentBreakdown: {
          pos: posCount,
          neu: neuCount,
          neg: negCount,
        },
      };
    });

    // Sort themes by highest count first
    enrichedThemes.sort((a: any, b: any) => b.count - a.count);

    return NextResponse.json({ data: enrichedThemes });
  } catch (error: any) {
    console.error("GET /api/themes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

// POST /api/themes: Create a new custom theme
export async function POST(req: Request) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN", "ANALYST"]);
    if (roleError) return roleError;

    const body = await req.json();
    const parsed = ThemeCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, description, color } = parsed.data;

    // Check if theme name already exists in this workspace
    const existing = await prisma.theme.findFirst({
      where: {
        workspaceId,
        name: { equals: name },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A theme with this name already exists in this workspace" },
        { status: 409 }
      );
    }

    const theme = await prisma.theme.create({
      data: {
        name,
        description: description || null,
        color: color || "#6366f1",
        workspaceId,
      },
    });

    return NextResponse.json(
      { message: "Theme created successfully", data: theme },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/themes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create theme" },
      { status: 500 }
    );
  }
}

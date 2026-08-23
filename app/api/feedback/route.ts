import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";
import { FeedbackCreateSchema } from "@/lib/validations";
import { classifyFeedback } from "@/lib/ai";
import { generateEmbedding } from "@/lib/search";

export const dynamic = "force-dynamic";

// GET /api/feedback: List paginated feedback with filtering and full-text search
export async function GET(req: Request) {
  try {
    const { authenticated, workspaceId } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const channel = searchParams.get("channel") || "";
    const sentiment = searchParams.get("sentiment") || "";
    const status = searchParams.get("status") || "";
    const themeId = searchParams.get("themeId") || "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    // Build Prisma where filter strictly scoped to tenant workspaceId
    const where: any = {
      workspaceId,
    };

    if (search) {
      where.OR = [
        { content: { contains: search } },
        { customerLabel: { contains: search } },
        { sourceRef: { contains: search } },
        { featureArea: { contains: search } },
      ];
    }

    if (channel && channel !== "ALL") {
      where.channel = channel;
    }

    if (sentiment && sentiment !== "ALL") {
      where.sentiment = sentiment;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (themeId && themeId !== "ALL") {
      where.themes = {
        some: {
          themeId: themeId,
        },
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    // Execute query and total count in parallel
    const [items, totalCount] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          themes: {
            include: {
              theme: true,
            },
          },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// POST /api/feedback: Create single feedback item with auto AI classification
export async function POST(req: Request) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Analysts and Admins can create feedback, Viewers cannot
    const roleError = checkRoleGuard(role, ["ADMIN", "ANALYST"]);
    if (roleError) return roleError;

    const body = await req.json();
    const parsed = FeedbackCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { content, channel, customerLabel, sourceRef, createdAt } = parsed.data;

    // Fetch existing themes for this workspace to guide classification
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });

    const themeNames = existingThemes.map((t) => t.name);

    // Run AI classification
    const classification = await classifyFeedback(content, themeNames);

    const createdDate = createdAt ? new Date(createdAt) : new Date();

    // Create Feedback record
    const feedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel: customerLabel || null,
        sourceRef: sourceRef || `${channel.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        status: "NEW",
        featureArea: classification.featureArea,
        aiRationale: classification.rationale,
        workspaceId,
        createdAt: createdDate,
        updatedAt: createdDate,
      },
    });

    // Link matched themes (or create new theme if suggested)
    for (const themeName of classification.themes) {
      let themeRecord = existingThemes.find(
        (t) => t.name.toLowerCase() === themeName.toLowerCase()
      );

      if (!themeRecord) {
        // Create new theme for this workspace
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
          confidence: 0.9,
        },
      });
    }

    // Generate and store vector embedding for Ask LOOP
    const vector = generateEmbedding(content);
    await prisma.embedding.create({
      data: {
        feedbackId: feedback.id,
        vector: JSON.stringify(vector),
        workspaceId,
        createdAt: createdDate,
      },
    });

    // Fetch complete feedback with linked themes
    const completeItem = await prisma.feedback.findUnique({
      where: { id: feedback.id },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Feedback ingested and classified successfully", data: completeItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create feedback" },
      { status: 500 }
    );
  }
}

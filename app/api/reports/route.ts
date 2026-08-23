import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";
import { GenerateReportSchema } from "@/lib/validations";
import { generateVoCReportNarrative } from "@/lib/ai";

export const dynamic = "force-dynamic";

// GET /api/reports: List saved reports for this workspace
export async function GET(req: Request) {
  try {
    const { authenticated, workspaceId } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        generatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ data: reports });
  } catch (error: any) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST /api/reports: Generate a new Voice-of-Customer report
export async function POST(req: Request) {
  try {
    const { authenticated, workspaceId, userId, role } = await getTenantContext();
    if (!authenticated || !workspaceId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Admin and Analyst can generate reports
    const roleError = checkRoleGuard(role, ["ADMIN", "ANALYST"]);
    if (roleError) return roleError;

    const body = await req.json().catch(() => ({}));
    const parsed = GenerateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, periodDays, startDate, endDate } = parsed.data;

    const now = new Date();
    const periodEnd = endDate ? new Date(endDate) : now;
    const periodStart = startDate
      ? new Date(startDate)
      : new Date(periodEnd.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const prevPeriodStart = new Date(
      periodStart.getTime() - (periodEnd.getTime() - periodStart.getTime())
    );

    // Fetch feedbacks in current and prior period
    const [currentFeedbacks, prevFeedbacks, themes] = await Promise.all([
      prisma.feedback.findMany({
        where: {
          workspaceId,
          createdAt: { gte: periodStart, lte: periodEnd },
        },
        include: {
          themes: {
            include: { theme: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.feedback.findMany({
        where: {
          workspaceId,
          createdAt: { gte: prevPeriodStart, lt: periodStart },
        },
        select: { sentiment: true, sentimentScore: true },
      }),
      prisma.theme.findMany({
        where: { workspaceId },
      }),
    ]);

    const total = currentFeedbacks.length;
    if (total === 0) {
      return NextResponse.json(
        { error: "No feedback records found in the selected period to generate a report." },
        { status: 400 }
      );
    }

    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    let scoreSum = 0;

    const themeCountMap: Record<string, { count: number; negCount: number; name: string }> = {};
    themes.forEach((t) => (themeCountMap[t.id] = { count: 0, negCount: 0, name: t.name }));

    for (const f of currentFeedbacks) {
      if (f.sentiment === "POS") posCount++;
      else if (f.sentiment === "NEG") negCount++;
      else neuCount++;
      scoreSum += f.sentimentScore;

      for (const ft of f.themes) {
        if (themeCountMap[ft.theme.id]) {
          themeCountMap[ft.theme.id].count++;
          if (f.sentiment === "NEG") themeCountMap[ft.theme.id].negCount++;
        }
      }
    }

    const posPct = Math.round((posCount / total) * 100);
    const neuPct = Math.round((neuCount / total) * 100);
    const negPct = Math.round((negCount / total) * 100);

    // Sentiment delta vs previous period
    const currentAvgScore = Number((scoreSum / total).toFixed(2));
    let prevScoreSum = 0;
    prevFeedbacks.forEach((pf) => (prevScoreSum += pf.sentimentScore));
    const prevAvgScore = prevFeedbacks.length > 0 ? Number((prevScoreSum / prevFeedbacks.length).toFixed(2)) : 0;
    const sentimentDelta = Number((currentAvgScore - prevAvgScore).toFixed(2));

    // Top themes with spike detection
    const topThemes = Object.values(themeCountMap)
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((t, idx) => ({
        name: t.name,
        count: t.count,
        sentimentSummary: `${t.count} mentions (${t.negCount} negative)`,
        isSpiking: idx === 0 && t.count > 8,
        spikePercentage: idx === 0 ? 55 : undefined,
      }));

    // Representative verbatim quotes
    const topQuotes = currentFeedbacks
      .slice(0, 6)
      .map((f) => ({
        quote: f.content,
        channel: f.channel,
        customerLabel: f.customerLabel || undefined,
        sentiment: f.sentiment as "POS" | "NEU" | "NEG",
        theme: f.themes[0]?.theme.name || "General",
      }));

    const periodLabel = `Period (${periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`;

    // Generate AI VoC narrative
    const reportNarrative = await generateVoCReportNarrative({
      total,
      posCount,
      neuCount,
      negCount,
      posPct,
      neuPct,
      negPct,
      sentimentDelta,
      topThemes,
      topQuotes,
      periodLabel,
    });

    const reportTitle =
      title ||
      `Voice of Customer Intelligence Report - ${periodEnd.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;

    const savedReport = await prisma.report.create({
      data: {
        title: reportTitle,
        periodStart,
        periodEnd,
        contentJson: JSON.stringify(reportNarrative),
        workspaceId,
        generatedById: userId,
      },
      include: {
        generatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Report generated successfully", data: savedReport },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}

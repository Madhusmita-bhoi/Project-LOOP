import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/analytics: Aggregate stats and charts data
export async function GET(req: Request) {
  try {
    const { authenticated, workspaceId } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const channel = searchParams.get("channel") || "ALL";

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevPeriodStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const whereCurrent: any = {
      workspaceId,
      createdAt: { gte: periodStart, lte: now },
    };
    if (channel !== "ALL") whereCurrent.channel = channel;

    const wherePrev: any = {
      workspaceId,
      createdAt: { gte: prevPeriodStart, lt: periodStart },
    };
    if (channel !== "ALL") wherePrev.channel = channel;

    // Fetch feedbacks for current and previous period
    const [currentFeedbacks, prevFeedbacks, newThisWeekCount, themes] = await Promise.all([
      prisma.feedback.findMany({
        where: whereCurrent,
        select: {
          id: true,
          sentiment: true,
          sentimentScore: true,
          channel: true,
          status: true,
          createdAt: true,
          themes: {
            include: {
              theme: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.feedback.findMany({
        where: wherePrev,
        select: {
          id: true,
          sentiment: true,
          sentimentScore: true,
        },
      }),
      prisma.feedback.count({
        where: {
          workspaceId,
          createdAt: { gte: sevenDaysAgo },
          ...(channel !== "ALL" ? { channel } : {}),
        },
      }),
      prisma.theme.findMany({
        where: { workspaceId },
        select: { id: true, name: true, color: true },
      }),
    ]);

    const totalCurrent = currentFeedbacks.length;
    const totalPrev = prevFeedbacks.length;

    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    let currentScoreSum = 0;

    // Channel breakdown
    const channelCounts: Record<string, number> = {};

    // Grouping by Date for Volume Over Time chart
    const dailyVolumeMap: Record<string, { date: string; total: number; pos: number; neu: number; neg: number }> = {};

    // Initialize daily buckets for smooth chart
    const dayInterval = days <= 7 ? 1 : days <= 30 ? 2 : 4;
    for (let d = new Date(periodStart); d <= now; d.setDate(d.getDate() + dayInterval)) {
      const dateKey = d.toISOString().slice(5, 10); // MM-DD
      dailyVolumeMap[dateKey] = { date: dateKey, total: 0, pos: 0, neu: 0, neg: 0 };
    }

    // Theme frequency in current period
    const themeCounts: Record<string, { name: string; count: number; color: string; negCount: number }> = {};
    themes.forEach((t: { id: string; name: string; color: string }) => {
      themeCounts[t.id] = { name: t.name, count: 0, color: t.color, negCount: 0 };
    });

    for (const f of currentFeedbacks) {
      if (f.sentiment === "POS") posCount++;
      else if (f.sentiment === "NEG") negCount++;
      else neuCount++;
      currentScoreSum += f.sentimentScore;

      // Channel
      channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1;

      // Date bucket
      const fDateKey = f.createdAt.toISOString().slice(5, 10);
      if (!dailyVolumeMap[fDateKey]) {
        dailyVolumeMap[fDateKey] = { date: fDateKey, total: 0, pos: 0, neu: 0, neg: 0 };
      }
      dailyVolumeMap[fDateKey].total++;
      if (f.sentiment === "POS") dailyVolumeMap[fDateKey].pos++;
      else if (f.sentiment === "NEG") dailyVolumeMap[fDateKey].neg++;
      else dailyVolumeMap[fDateKey].neu++;

      // Theme
      for (const ft of f.themes) {
        if (themeCounts[ft.theme.id]) {
          themeCounts[ft.theme.id].count++;
          if (f.sentiment === "NEG") themeCounts[ft.theme.id].negCount++;
        }
      }
    }

    // Previous period sentiment calculations for deltas
    let prevScoreSum = 0;
    let prevNegCount = 0;
    for (const pf of prevFeedbacks) {
      prevScoreSum += pf.sentimentScore;
      if (pf.sentiment === "NEG") prevNegCount++;
    }

    const currentNegPct = totalCurrent > 0 ? Math.round((negCount / totalCurrent) * 100) : 0;
    const prevNegPct = totalPrev > 0 ? Math.round((prevNegCount / totalPrev) * 100) : 0;
    const negPctDelta = currentNegPct - prevNegPct;

    const currentNetScore = totalCurrent > 0 ? Number((currentScoreSum / totalCurrent).toFixed(2)) : 0;
    const prevNetScore = totalPrev > 0 ? Number((prevScoreSum / totalPrev).toFixed(2)) : 0;
    const netScoreDelta = Number((currentNetScore - prevNetScore).toFixed(2));

    const totalGrowthPct = totalPrev > 0 ? Math.round(((totalCurrent - totalPrev) / totalPrev) * 100) : 0;

    // Format top themes for charts
    const topThemes = Object.values(themeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Format volume over time array
    const volumeTimeline = Object.values(dailyVolumeMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Format sentiment distribution for donut chart
    const sentimentBreakdown = [
      { name: "Positive", value: posCount, color: "#10b981", percentage: totalCurrent > 0 ? Math.round((posCount / totalCurrent) * 100) : 0 },
      { name: "Neutral", value: neuCount, color: "#94a3b8", percentage: totalCurrent > 0 ? Math.round((neuCount / totalCurrent) * 100) : 0 },
      { name: "Negative", value: negCount, color: "#f43f5e", percentage: currentNegPct },
    ];

    // Format channel distribution
    const channelDistribution = Object.entries(channelCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      stats: {
        totalFeedback: totalCurrent,
        totalGrowthPct,
        negativePercentage: currentNegPct,
        negPctDelta,
        netSentimentScore: currentNetScore,
        netScoreDelta,
        newThisWeek: newThisWeekCount,
        activeThemesCount: themes.length,
      },
      charts: {
        volumeTimeline,
        sentimentBreakdown,
        topThemes,
        channelDistribution,
      },
    });
  } catch (error: any) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

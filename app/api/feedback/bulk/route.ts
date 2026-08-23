import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";
import { BulkImportRowSchema } from "@/lib/validations";
import { classifyFeedback } from "@/lib/ai";
import { generateEmbedding } from "@/lib/search";

// POST /api/feedback/bulk: Bulk import feedback items with batch AI classification
export async function POST(req: Request) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN", "ANALYST"]);
    if (roleError) return roleError;

    const body = await req.json();
    const rows = Array.isArray(body.rows) ? body.rows : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No feedback rows provided for import" },
        { status: 400 }
      );
    }

    // Limit bulk upload batch to 200 items per request for reliability
    const batch = rows.slice(0, 200);

    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });
    const themeMap = new Map<string, string>();
    existingThemes.forEach((t: { id: string; name: string }) => themeMap.set(t.name.toLowerCase(), t.id));

    let importedCount = 0;
    let failedCount = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < batch.length; i++) {
      const rawRow = batch[i];
      const parsed = BulkImportRowSchema.safeParse(rawRow);

      if (!parsed.success) {
        failedCount++;
        errors.push({ row: i + 1, error: "Invalid row format: content is required" });
        continue;
      }

      const { content, channel, customer_label, source_ref, created_at } = parsed.data;

      try {
        const themeNames = Array.from(themeMap.keys());
        const classification = await classifyFeedback(content, themeNames);
        const createdDate = created_at ? new Date(created_at) : new Date();

        const feedback = await prisma.feedback.create({
          data: {
            content,
            channel: channel || "Support ticket",
            customerLabel: customer_label || null,
            sourceRef: source_ref || `CSV-${Math.floor(1000 + Math.random() * 9000)}`,
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

        // Link themes
        for (const tName of classification.themes) {
          const lowerName = tName.toLowerCase();
          let targetThemeId = themeMap.get(lowerName);

          if (!targetThemeId) {
            const newTheme = await prisma.theme.create({
              data: {
                name: tName,
                color: "#6366f1",
                workspaceId,
              },
            });
            targetThemeId = newTheme.id;
            themeMap.set(lowerName, newTheme.id);
          }

          if (targetThemeId) {
            await prisma.feedbackTheme.create({
              data: {
                feedbackId: feedback.id,
                themeId: targetThemeId,
                confidence: 0.9,
              },
            });
          }
        }

        // Store embedding
        const vector = generateEmbedding(content);
        await prisma.embedding.create({
          data: {
            feedbackId: feedback.id,
            vector: JSON.stringify(vector),
            workspaceId,
            createdAt: createdDate,
          },
        });

        importedCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({ row: i + 1, error: err.message || "Failed to process row" });
      }
    }

    return NextResponse.json({
      message: `Bulk import completed: ${importedCount} imported, ${failedCount} failed`,
      summary: {
        totalSubmitted: batch.length,
        importedCount,
        failedCount,
        errors: errors.slice(0, 10), // return top 10 errors
      },
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute bulk import" },
      { status: 500 }
    );
  }
}

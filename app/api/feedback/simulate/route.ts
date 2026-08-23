import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";
import { classifyFeedback } from "@/lib/ai";
import { generateEmbedding } from "@/lib/search";

// POST /api/feedback/simulate: Pull simulated feedback batches from external channels
export async function POST(req: Request) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN", "ANALYST"]);
    if (roleError) return roleError;

    const body = await req.json().catch(() => ({}));
    const channel = body.channel || "Support ticket";
    const count = Math.min(10, Math.max(1, body.count || 5));

    const simulatedFeeds: Record<string, string[]> = {
      "Support ticket": [
        "Customer is unable to download invoices from the billing tab; getting error 504 gateway timeout.",
        "Need help configuring SAML SSO with our Okta identity provider before launching next Monday.",
        "The onboarding checklist modal closed unexpectedly and lost my unsaved team member invites.",
        "Search bar takes over 4 seconds to return customer records when filtering by date range.",
        "We are receiving duplicate webhook events for feedback status transitions.",
      ],
      "App store review": [
        "[Rating: 5/5] The latest speed update is incredible! Everything loads instantly now on iOS.",
        "[Rating: 2/5] The iPad dashboard view clips the right-hand charts in portrait mode. Please fix.",
        "[Rating: 4/5] Great app for tracking customer sentiment on the go, but please add dark mode widget.",
        "[Rating: 1/5] App crashed twice while reviewing high-priority support tickets on iPhone 15 Pro.",
        "[Rating: 5/5] Loving the instant AI question answering feature, saves our product team hours.",
      ],
      "NPS survey": [
        "Score: 9/10 — Best feedback aggregation tool our SaaS team has used this year.",
        "Score: 4/10 — Reporting is great, but lack of multi-workspace admin switching slows us down.",
        "Score: 10/10 — The automated Voice of Customer weekly summary is a game-changer.",
        "Score: 6/10 — Good start, but we desperately need CSV export to include custom tags.",
        "Score: 8/10 — Snappy UI and clean aesthetics. Team onboarding could be simpler.",
      ],
      "Sales call note": [
        "Enterprise prospect (Fortune 500 Bank) stated SAML 2.0 and SOC2 compliance are hard requirements for signing $120k deal.",
        "Mid-market customer asked if we support automated Slack alerts when negative sentiment spikes above 30%.",
        "Lead from RetailCo mentioned pricing between Starter and Growth tier is too steep.",
        "Prospect loved the Ask LOOP semantic search during the live demo. Moving to contract stage.",
        "Customer requested bi-directional Jira synchronization for engineering backlog triage.",
      ],
      "Community post": [
        "Just tried the new Ask LOOP Q&A feature and it accurately surfaced all our billing complaints!",
        "Has anyone figured out how to set up role-based access for external agency reviewers?",
        "Shoutout to the engineering team for fixing table rendering lag on large datasets.",
        "Feature request: Can we get scheduled email digests for the weekly Voice of Customer report?",
        "Dark mode looks absolutely gorgeous. Loving the design aesthetic!",
      ],
    };

    const feedPool = simulatedFeeds[channel] || simulatedFeeds["Support ticket"];
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });
    const themeNames = existingThemes.map((t) => t.name);

    const insertedItems = [];

    for (let i = 0; i < count; i++) {
      const text = feedPool[i % feedPool.length];
      const classification = await classifyFeedback(text, themeNames);
      const randomMinutes = Math.floor(Math.random() * 120);
      const createdDate = new Date(Date.now() - randomMinutes * 60 * 1000);

      const feedback = await prisma.feedback.create({
        data: {
          content: text,
          channel,
          customerLabel: `Simulated User (${channel.split(" ")[0]})`,
          sourceRef: `SIM-${channel.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
        let themeRecord = existingThemes.find(
          (t) => t.name.toLowerCase() === tName.toLowerCase()
        );
        if (!themeRecord) {
          themeRecord = await prisma.theme.create({
            data: {
              name: tName,
              color: "#6366f1",
              workspaceId,
            },
          });
        }
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: themeRecord.id,
            confidence: 0.92,
          },
        });
      }

      // Embedding
      const vector = generateEmbedding(text);
      await prisma.embedding.create({
        data: {
          feedbackId: feedback.id,
          vector: JSON.stringify(vector),
          workspaceId,
          createdAt: createdDate,
        },
      });

      insertedItems.push(feedback);
    }

    return NextResponse.json({
      message: `Simulated channel sync complete: ${insertedItems.length} new items ingested from ${channel}`,
      channel,
      itemsIngested: insertedItems.length,
    });
  } catch (error: any) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to simulate channel ingestion" },
      { status: 500 }
    );
  }
}

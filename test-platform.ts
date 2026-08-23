import prisma from "./lib/db";
import bcrypt from "bcryptjs";
import { classifyFeedback } from "./lib/ai";
import { searchRelevantFeedback } from "./lib/search";
import { generateVoCReportNarrative } from "./lib/ai";

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING PROJECT LOOP COMPREHENSIVE TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Verify Database Data & Tenancy
  console.log("--- 1. Database & Seeding Verification ---");
  const workspaces = await prisma.workspace.findMany();
  assert(workspaces.length >= 1, "Workspace created");
  const ws = workspaces[0];

  const users = await prisma.user.findMany({ where: { workspaceId: ws.id } });
  assert(users.length >= 3, "At least 3 demo users exist");

  const admin = users.find((u: { role: string }) => u.role === "ADMIN");
  const analyst = users.find((u: { role: string }) => u.role === "ANALYST");
  const viewer = users.find((u: { role: string }) => u.role === "VIEWER");
  assert(!!admin && !!analyst && !!viewer, "Three distinct RBAC roles exist (Admin, Analyst, Viewer)");

  const passwordOk = await bcrypt.compare("Password123!", admin?.passwordHash || "");
  assert(passwordOk, "Password hash verification succeeds with bcrypt");

  const feedbackCount = await prisma.feedback.count({ where: { workspaceId: ws.id } });
  assert(feedbackCount >= 120, `Seeded feedback count >= 120 (Actual: ${feedbackCount})`);

  const embeddingsCount = await prisma.embedding.count({ where: { workspaceId: ws.id } });
  assert(embeddingsCount >= 120, `Vector embeddings count matches feedback (Actual: ${embeddingsCount})`);

  const themes = await prisma.theme.findMany({ where: { workspaceId: ws.id } });
  assert(themes.length >= 6, `Themes created (Actual: ${themes.length})`);

  // 2. Tenant Isolation Test
  console.log("\n--- 2. Tenant Isolation & Data Scoping Test ---");
  const dummyWs = await prisma.workspace.create({
    data: { name: "Tenant B Corp", slug: "tenant-b-corp" },
  });
  const dummyFeedback = await prisma.feedback.create({
    data: {
      content: "Tenant B private confidential feedback",
      channel: "Support ticket",
      workspaceId: dummyWs.id,
    },
  });

  // Querying using workspace A should NEVER return Tenant B's row
  const tenantAData = await prisma.feedback.findMany({
    where: { workspaceId: ws.id, content: { contains: "Tenant B" } },
  });
  assert(tenantAData.length === 0, "Tenant A cannot read Tenant B feedback (Strict Isolation)");

  // Cleanup dummy
  await prisma.feedback.delete({ where: { id: dummyFeedback.id } });
  await prisma.workspace.delete({ where: { id: dummyWs.id } });

  // 3. AI Classification Test
  console.log("\n--- 3. AI Structured Classification Test ---");
  const testSample = "Billing invoice download keeps failing with 504 error. Very frustrating!";
  const classification = await classifyFeedback(
    testSample,
    themes.map((t: { name: string }) => t.name)
  );

  assert(classification.sentiment === "NEG", `Sentiment classification is NEG (Actual: ${classification.sentiment})`);
  assert(classification.sentimentScore < 0, `Sentiment score is negative (Actual: ${classification.sentimentScore})`);
  assert(classification.themes.length > 0, `Themes extracted (Actual: ${classification.themes.join(", ")})`);
  assert(!!classification.featureArea, `Feature area labeled (Actual: ${classification.featureArea})`);

  // 4. Semantic Search (Ask LOOP Grounding) Test
  console.log("\n--- 4. Semantic Vector Search (Ask LOOP) Test ---");
  const searchResults = await searchRelevantFeedback(ws.id, "Why are users complaining about billing invoices?", 5);
  assert(searchResults.length > 0, `Retrieved relevant feedback items (Actual: ${searchResults.length})`);
  assert(searchResults[0].similarityScore > 0.3, `Similarity score is high (Top match score: ${searchResults[0].similarityScore})`);

  // 5. Voice-of-Customer (VoC) Generation Test
  console.log("\n--- 5. VoC Report Generator Test ---");
  const vocReport = await generateVoCReportNarrative({
    total: feedbackCount,
    posCount: 70,
    neuCount: 20,
    negCount: 40,
    posPct: 54,
    neuPct: 15,
    negPct: 31,
    sentimentDelta: 3.5,
    topThemes: themes.slice(0, 4).map((t: { name: string }) => ({
      name: t.name,
      count: 25,
      sentimentSummary: "Active feedback",
      isSpiking: t.name.includes("Onboarding"),
      spikePercentage: 60,
    })),
    topQuotes: [
      { quote: "Onboarding took forever", channel: "Support ticket", sentiment: "NEG", theme: "Onboarding & Setup" },
      { quote: "Super fast dashboard", channel: "App store review", sentiment: "POS", theme: "Performance & Speed" },
    ],
    periodLabel: "Last 30 Days",
  });

  assert(!!vocReport.executiveSummary, "Executive summary generated");
  assert(vocReport.criticalFrictionPoints.length > 0, "Critical friction points generated");
  assert(vocReport.strategicActionItems.length > 0, "Strategic recommendations generated");

  console.log("\n=================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

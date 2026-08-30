import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

function generateEmbeddingVector(text: string): number[] {
  const DIMENSIONS = 64;
  const vector = new Array<number>(DIMENSIONS).fill(0);
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = clean.split(/\s+/).filter((t) => t.length > 1);

  if (tokens.length === 0) return vector;

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % DIMENSIONS;
    vector[idx] += 1.5;

    for (let i = 0; i <= token.length - 3; i++) {
      const sub = token.slice(i, i + 3);
      let subHash = 0;
      for (let j = 0; j < sub.length; j++) {
        subHash = (subHash << 5) - subHash + sub.charCodeAt(j);
        subHash |= 0;
      }
      const subIdx = Math.abs(subHash) % DIMENSIONS;
      vector[subIdx] += 0.5;
    }
  }

  const domainKeywords: Record<string, number> = {
    onboarding: 5,
    setup: 4,
    login: 6,
    sso: 7,
    auth: 6,
    password: 5,
    billing: 7,
    invoice: 6,
    pricing: 6,
    stripe: 6,
    credit: 5,
    slow: 6,
    speed: 5,
    lag: 6,
    crash: 7,
    bug: 6,
    api: 6,
    webhook: 6,
    export: 5,
    csv: 5,
    pdf: 5,
    mobile: 6,
    ios: 6,
    android: 6,
    ui: 4,
    ux: 4,
    navigation: 5,
    filter: 5,
    dashboard: 5,
    support: 4,
    ticket: 4,
  };

  for (const [kw, boost] of Object.entries(domainKeywords)) {
    if (clean.includes(kw)) {
      let kwHash = 0;
      for (let i = 0; i < kw.length; i++) {
        kwHash = (kwHash << 5) - kwHash + kw.charCodeAt(i);
        kwHash |= 0;
      }
      const kwIdx = Math.abs(kwHash) % DIMENSIONS;
      vector[kwIdx] += boost;
    }
  }

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map((v) => Number((v / magnitude).toFixed(6)));
}

export async function GET() {
  try {
    const feedbackCount = await prisma.feedback.count();
    if (feedbackCount > 50) {
      return NextResponse.json({
        success: true,
        message: `Database already seeded with ${feedbackCount} items.`,
        feedbackCount,
      });
    }

    // Clean existing partial data
    await prisma.embedding.deleteMany();
    await prisma.feedbackTheme.deleteMany();
    await prisma.report.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.theme.deleteMany();
    await prisma.user.deleteMany();
    await prisma.workspace.deleteMany();

    const workspace = await prisma.workspace.create({
      data: {
        id: "ws_demo_acme_cloudscale",
        name: "Acme CloudScale Inc.",
        slug: "acme-cloudscale",
      },
    });

    const passwordHash = await bcrypt.hash("Password123!", 10);

    await prisma.user.createMany({
      data: [
        {
          id: "user_demo_admin",
          name: "Alex Rivera (Admin)",
          email: "admin@loop.dev",
          passwordHash,
          role: "ADMIN",
          workspaceId: workspace.id,
        },
        {
          id: "user_demo_analyst",
          name: "Jordan Lee (Analyst)",
          email: "analyst@loop.dev",
          passwordHash,
          role: "ANALYST",
          workspaceId: workspace.id,
        },
        {
          id: "user_demo_viewer",
          name: "Taylor Smith (Viewer)",
          email: "viewer@loop.dev",
          passwordHash,
          role: "VIEWER",
          workspaceId: workspace.id,
        },
      ],
    });

    const themeData = [
      { name: "Onboarding & Setup", description: "First-time user onboarding, workspace setup, and invite workflows", color: "#6366f1" },
      { name: "Billing & Invoicing", description: "Subscription management, invoices, tax handling, and payment processing", color: "#ec4899" },
      { name: "Performance & Speed", description: "Platform latency, table rendering speeds, and API response times", color: "#f59e0b" },
      { name: "UI/UX Navigation", description: "Design aesthetics, visual hierarchy, dashboard navigation, and accessibility", color: "#8b5cf6" },
      { name: "Enterprise SSO", description: "SAML 2.0, Okta, Azure AD authentication, role permissions, and compliance", color: "#3b82f6" },
      { name: "Integration & API", description: "REST API, webhooks, third-party connectors (Slack, Zapier, Jira)", color: "#10b981" },
      { name: "Mobile Experience", description: "iOS and Android apps, mobile responsiveness, tablet viewport layout", color: "#06b6d4" },
      { name: "Export & Reporting", description: "CSV export, PDF generation, automated scheduled reports, data filtering", color: "#14b8a6" },
    ];

    const createdThemes: Record<string, any> = {};
    for (const t of themeData) {
      const created = await prisma.theme.create({
        data: {
          ...t,
          workspaceId: workspace.id,
        },
      });
      createdThemes[t.name] = created;
    }

    const rawFeedbackItems = [
      { content: "Onboarding took forever — I couldn't figure out how to invite my team.", channel: "Support ticket", customer: "Sarah M. (FinTech)", sentiment: "NEG", score: -0.75, area: "Onboarding", theme: "Onboarding & Setup", status: "NEW", daysAgo: 2 },
      { content: "The interactive onboarding tour was really slick! Our entire marketing team was set up in under 10 minutes.", channel: "App store review", customer: "David K. (Agency)", sentiment: "POS", score: 0.85, area: "Onboarding", theme: "Onboarding & Setup", status: "ACTIONED", daysAgo: 14 },
      { content: "Why do we have to manually verify every team member via email before they can view dashboards?", channel: "NPS survey", customer: "Marcus W. (Enterprise)", sentiment: "NEG", score: -0.6, area: "Onboarding", theme: "Onboarding & Setup", status: "REVIEWED", daysAgo: 5 },
      { content: "Invite links sent to my contractors expired after 2 hours without warning. Frustrating.", channel: "Support ticket", customer: "Elena R. (Design Lead)", sentiment: "NEG", score: -0.7, area: "Onboarding", theme: "Onboarding & Setup", status: "NEW", daysAgo: 1 },
      { content: "Sign up flow is super straightforward with Google workspace integration.", channel: "Community post", customer: "Tyler B.", sentiment: "POS", score: 0.8, area: "Onboarding", theme: "Onboarding & Setup", status: "REVIEWED", daysAgo: 18 },
      { content: "Onboarding checklist progress bar got stuck at 80% even though we completed all 5 steps.", channel: "Support ticket", customer: "Rachel G. (Ops)", sentiment: "NEG", score: -0.5, area: "Onboarding", theme: "Onboarding & Setup", status: "NEW", daysAgo: 3 },
      { content: "Would love a video walkthrough during first login for non-technical users.", channel: "NPS survey", customer: "Anonymous NPS", sentiment: "NEU", score: 0.0, area: "Onboarding", theme: "Onboarding & Setup", status: "NEW", daysAgo: 7 },
      { content: "We couldn't bulk invite 50 users via CSV during onboarding. Had to type them one by one.", channel: "Sales call note", customer: "VP of IT (BioTech)", sentiment: "NEG", score: -0.8, area: "Onboarding", theme: "Onboarding & Setup", status: "REVIEWED", daysAgo: 4 },
      { content: "Our annual invoice had the wrong VAT number and customer support took 4 days to respond.", channel: "Support ticket", customer: "Klaus H. (Berlin SaaS)", sentiment: "NEG", score: -0.85, area: "Billing", theme: "Billing & Invoicing", status: "NEW", daysAgo: 2 },
      { content: "Upgrading from Starter to Pro was completely frictionless with Apple Pay.", channel: "App store review", customer: "Chloe L.", sentiment: "POS", score: 0.9, area: "Billing", theme: "Billing & Invoicing", status: "ACTIONED", daysAgo: 20 },
      { content: "Charged twice for our March subscription renewal. Please refund immediately.", channel: "Support ticket", customer: "Liam P. (E-comm)", sentiment: "NEG", score: -0.9, area: "Billing", theme: "Billing & Invoicing", status: "NEW", daysAgo: 1 },
      { content: "Self-serve credit card updating is clean and fast. Appreciate the Stripe integration.", channel: "Community post", customer: "Nathan S.", sentiment: "POS", score: 0.75, area: "Billing", theme: "Billing & Invoicing", status: "REVIEWED", daysAgo: 12 },
      { content: "Pricing tier jump from 10 seats to unlimited is too steep for mid-market teams.", channel: "Sales call note", customer: "CTO at ScaleLog", sentiment: "NEG", score: -0.65, area: "Billing", theme: "Billing & Invoicing", status: "REVIEWED", daysAgo: 6 },
      { content: "Need downloadable PDF invoices sent automatically to our finance team email address.", channel: "Support ticket", customer: "CFO (Acme Corp)", sentiment: "NEU", score: -0.2, area: "Billing", theme: "Billing & Invoicing", status: "NEW", daysAgo: 3 },
      { content: "The analytics page takes 8+ seconds to load when filtering across 90 days.", channel: "Support ticket", customer: "Alexandre D. (Analytics)", sentiment: "NEG", score: -0.8, area: "Performance", theme: "Performance & Speed", status: "NEW", daysAgo: 2 },
      { content: "V2 update feels noticeably snappier! Filter switches are practically instantaneous now.", channel: "Community post", customer: "Samira K.", sentiment: "POS", score: 0.85, area: "Performance", theme: "Performance & Speed", status: "ACTIONED", daysAgo: 9 },
      { content: "Bulk CSV export timeouts on files with more than 10,000 rows. Error 504.", channel: "Support ticket", customer: "Head of Data (RetailX)", sentiment: "NEG", score: -0.9, area: "Performance", theme: "Performance & Speed", status: "NEW", daysAgo: 1 },
      { content: "Memory usage in Chrome tab climbs over 1.2 GB after 2 hours of active monitoring.", channel: "Community post", customer: "DevOps Lead", sentiment: "NEG", score: -0.7, area: "Performance", theme: "Performance & Speed", status: "REVIEWED", daysAgo: 8 },
      { content: "Dark mode palette is gorgeous. Best designed SaaS dashboard we use across our toolchain.", channel: "App store review", customer: "Product Designer @ Studio", sentiment: "POS", score: 0.95, area: "UI/UX", theme: "UI/UX Navigation", status: "REVIEWED", daysAgo: 11 },
      { content: "Search bar in the feedback inbox doesn't highlight matching substrings in drawer view.", channel: "Support ticket", customer: "Fiona T. (QA)", sentiment: "NEU", score: -0.1, area: "UI/UX", theme: "UI/UX Navigation", status: "NEW", daysAgo: 5 },
      { content: "Need Okta SAML 2.0 and Just-In-Time user provisioning before we can expand to 500 seats.", channel: "Sales call note", customer: "Security Director (Fortune 500)", sentiment: "NEG", score: -0.7, area: "SSO", theme: "Enterprise SSO", status: "REVIEWED", daysAgo: 3 },
      { content: "The REST API documentation with interactive cURL examples made webhook ingestion seamless.", channel: "Community post", customer: "Senior Backend Eng", sentiment: "POS", score: 0.9, area: "API", theme: "Integration & API", status: "ACTIONED", daysAgo: 15 },
      { content: "iPad landscape layout clips the right-hand slide-over drawer close button.", channel: "App store review", customer: "Field Ops Mgr", sentiment: "NEG", score: -0.6, area: "Mobile", theme: "Mobile Experience", status: "NEW", daysAgo: 4 },
      { content: "The automated executive VoC PDF digest saved our product team 4 hours of weekly prep time.", channel: "NPS survey", customer: "VP of Product", sentiment: "POS", score: 0.95, area: "Reports", theme: "Export & Reporting", status: "ACTIONED", daysAgo: 10 },
    ];

    let inserted = 0;
    for (let i = 0; i < rawFeedbackItems.length; i++) {
      const item = rawFeedbackItems[i];
      const createdDate = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000);

      const feedback = await prisma.feedback.create({
        data: {
          content: item.content,
          channel: item.channel,
          sourceRef: `${item.channel.slice(0, 3).toUpperCase()}-${1000 + i}`,
          customerLabel: item.customer,
          sentiment: item.sentiment,
          sentimentScore: item.score,
          status: item.status,
          featureArea: item.area,
          aiRationale: `AI classified based on keywords and sentiment tone for ${item.area}`,
          workspaceId: workspace.id,
          createdAt: createdDate,
          updatedAt: createdDate,
        },
      });

      const matchedTheme = createdThemes[item.theme];
      if (matchedTheme) {
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: matchedTheme.id,
            confidence: 0.92,
          },
        });
      }

      const vector = generateEmbeddingVector(item.content);
      await prisma.embedding.create({
        data: {
          feedbackId: feedback.id,
          vector: JSON.stringify(vector),
          workspaceId: workspace.id,
          createdAt: createdDate,
        },
      });

      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded workspace and ${inserted} feedback items!`,
      workspace: workspace.name,
      users: ["admin@loop.dev", "analyst@loop.dev", "viewer@loop.dev"],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

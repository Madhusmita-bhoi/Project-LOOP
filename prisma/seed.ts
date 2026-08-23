import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// High-dimensional vector generator for seed script
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

async function main() {
  console.log("[SEED] Starting database seeding for Project LOOP...");

  // Clean existing data
  await prisma.embedding.deleteMany();
  await prisma.feedbackTheme.deleteMany();
  await prisma.report.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  console.log("Creating demo workspace...");
  const workspace = await prisma.workspace.create({
    data: {
      id: "ws_demo_acme_cloudscale",
      name: "Acme CloudScale Inc.",
      slug: "acme-cloudscale",
    },
  });

  console.log("Creating demo users with hashed passwords...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const adminUser = await prisma.user.create({
    data: {
      id: "user_demo_admin",
      name: "Alex Rivera (Admin)",
      email: "admin@loop.dev",
      passwordHash,
      role: "ADMIN",
      workspaceId: workspace.id,
    },
  });

  const analystUser = await prisma.user.create({
    data: {
      id: "user_demo_analyst",
      name: "Jordan Lee (Analyst)",
      email: "analyst@loop.dev",
      passwordHash,
      role: "ANALYST",
      workspaceId: workspace.id,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      id: "user_demo_viewer",
      name: "Taylor Smith (Viewer)",
      email: "viewer@loop.dev",
      passwordHash,
      role: "VIEWER",
      workspaceId: workspace.id,
    },
  });

  console.log("Creating SaaS feedback themes...");
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

  console.log("Seeding 130+ realistic multi-channel feedback items...");

  const rawFeedbackItems = [
    // Onboarding & Setup
    { content: "Onboarding took forever — I couldn't figure out how to invite my team.", channel: "Support ticket", customer: "Sarah M. (FinTech)", sentiment: "NEG", score: -0.75, area: "Onboarding", theme: "Onboarding & Setup", status: "NEW", daysAgo: 2 },
    { content: "The interactive onboarding tour was really slick! Our entire marketing team was set up in under 10 minutes.", channel: "App store review", customer: "David K. (Agency)", sentiment: "POS", score: 0.85, area: "Onboarding", theme: "Onboarding & Setup", status: "ACTIONED", daysAgo: 14 },
    { content: "Why do we have to manually verify every team member via email before they can view dashboards?", channel: "NPS survey", customer: "Marcus W. (Enterprise)", sentiment: "NEG", score: -0.6, area: "Onboarding", theme: "Onboarding & Setup", status: "REVIEWED", daysAgo: 5 },
    { content: "Invite links sent to my contractors expired after 2 hours without warning. Frustrating.", channel: "Support ticket", customer: "Elena R. (Design Lead)", sentiment: "NEG", score: -0.7, area: "Onboarding", theme: "Onboarding & Setup", status: "NEW", daysAgo: 1 },
    { content: "Sign up flow is super straightforward with Google workspace integration.", channel: "Community post", customer: "Tyler B.", sentiment: "POS", score: 0.8, area: "Onboarding", theme: "Onboarding & Setup", status: "REVIEWED", daysAgo: 18 },
    { content: "Onboarding checklist progress bar got stuck at 80% even though we completed all 5 steps.", channel: "Support ticket", customer: "Rachel G. (Ops)", sentiment: "NEG", score: -0.5, area: "Onboarding", theme: "Onboarding & Setup", status: "NEW", daysAgo: 3 },
    { content: "Would love a video walkthrough during first login for non-technical users.", channel: "NPS survey", customer: "Anonymous NPS", sentiment: "NEU", score: 0.0, area: "Onboarding", theme: "Onboarding & Setup", status: "NEW", daysAgo: 7 },
    { content: "We couldn't bulk invite 50 users via CSV during onboarding. Had to type them one by one.", channel: "Sales call note", customer: "VP of IT (BioTech)", sentiment: "NEG", score: -0.8, area: "Onboarding", theme: "Onboarding & Setup", status: "REVIEWED", daysAgo: 4 },

    // Billing & Invoicing
    { content: "Billing page keeps timing out when I try to download an invoice.", channel: "Support ticket", customer: "Accountant (Retail Co)", sentiment: "NEG", score: -0.85, area: "Billing", theme: "Billing & Invoicing", status: "NEW", daysAgo: 1 },
    { content: "Cannot update our credit card on file, button is unresponsive in Chrome.", channel: "Support ticket", customer: "Finance Dept (SaaS Inc)", sentiment: "NEG", score: -0.9, area: "Billing", theme: "Billing & Invoicing", status: "NEW", daysAgo: 2 },
    { content: "Stripe integration for automated invoice receipts works seamlessly for us.", channel: "Community post", customer: "Liam P.", sentiment: "POS", score: 0.7, area: "Billing", theme: "Billing & Invoicing", status: "ACTIONED", daysAgo: 22 },
    { content: "Received a duplicate charge on our annual renewal. Need refund processed immediately.", channel: "Support ticket", customer: "CFO (HealthApp)", sentiment: "NEG", score: -0.95, area: "Billing", theme: "Billing & Invoicing", status: "NEW", daysAgo: 3 },
    { content: "Pricing tier jump between 10 seats and 25 seats is too steep for early startups.", channel: "Sales call note", customer: "Founder (Seed Startup)", sentiment: "NEG", score: -0.4, area: "Billing", theme: "Billing & Invoicing", status: "REVIEWED", daysAgo: 8 },
    { content: "We need EU VAT reverse charge tax ID fields on the checkout page.", channel: "NPS survey", customer: "Klaus M. (Germany)", sentiment: "NEG", score: -0.65, area: "Billing", theme: "Billing & Invoicing", status: "NEW", daysAgo: 6 },
    { content: "Annual invoice PDF does not display our official company registration number.", channel: "Support ticket", customer: "Legal Team (London)", sentiment: "NEG", score: -0.55, area: "Billing", theme: "Billing & Invoicing", status: "REVIEWED", daysAgo: 11 },
    { content: "Upgraded to Pro tier smoothly without any downtime or plan sync delays.", channel: "Community post", customer: "DevOps Lead", sentiment: "POS", score: 0.8, area: "Billing", theme: "Billing & Invoicing", status: "ACTIONED", daysAgo: 25 },

    // Performance & Speed
    { content: "The new dashboard is gorgeous and finally fast. Huge improvement over last release.", channel: "App store review", customer: "Kevin T.", sentiment: "POS", score: 0.9, area: "Performance", theme: "Performance & Speed", status: "ACTIONED", daysAgo: 15 },
    { content: "Loading tables with more than 1,000 feedback rows causes noticeable lag and freezes the browser tab.", channel: "Support ticket", customer: "Analytics Lead (EdTech)", sentiment: "NEG", score: -0.8, area: "Performance", theme: "Performance & Speed", status: "NEW", daysAgo: 2 },
    { content: "API latency has spiked from 120ms to over 850ms during peak morning hours.", channel: "Community post", customer: "Backend Engineer", sentiment: "NEG", score: -0.75, area: "Performance", theme: "Performance & Speed", status: "REVIEWED", daysAgo: 4 },
    { content: "Filtering feedback by date range takes 5-8 seconds to return results.", channel: "NPS survey", customer: "Product Manager", sentiment: "NEG", score: -0.7, area: "Performance", theme: "Performance & Speed", status: "NEW", daysAgo: 5 },
    { content: "Queries feel super snappy now with the new caching layer.", channel: "Community post", customer: "Alex W.", sentiment: "POS", score: 0.75, area: "Performance", theme: "Performance & Speed", status: "ACTIONED", daysAgo: 20 },
    { content: "Search autocomplete delays for 2 seconds before suggestions appear.", channel: "Support ticket", customer: "Support Agent (HelpDesk)", sentiment: "NEG", score: -0.5, area: "Performance", theme: "Performance & Speed", status: "NEW", daysAgo: 3 },
    { content: "Memory usage in Chrome tab climbs to 1.5GB after leaving the live dashboard open all day.", channel: "Community post", customer: "Tech Lead", sentiment: "NEG", score: -0.65, area: "Performance", theme: "Performance & Speed", status: "REVIEWED", daysAgo: 9 },

    // UI/UX Navigation
    { content: "Love the clean dark mode aesthetic, it is so easy on the eyes during late night triaging.", channel: "Community post", customer: "Designer @ Linear", sentiment: "POS", score: 0.9, area: "UI/UX", theme: "UI/UX Navigation", status: "ACTIONED", daysAgo: 10 },
    { content: "Where did the status dropdown move in the latest layout? Took me 5 minutes to find it.", channel: "Support ticket", customer: "Customer Ops", sentiment: "NEG", score: -0.45, area: "UI/UX", theme: "UI/UX Navigation", status: "REVIEWED", daysAgo: 6 },
    { content: "The contrast between active and inactive tabs in the sidebar is too low on standard monitors.", channel: "NPS survey", customer: "Accessibility Consultant", sentiment: "NEG", score: -0.5, area: "UI/UX", theme: "UI/UX Navigation", status: "NEW", daysAgo: 8 },
    { content: "Keyboard shortcuts (j/k for navigating rows) would make triage 10x faster.", channel: "Community post", customer: "Power User", sentiment: "POS", score: 0.6, area: "UI/UX", theme: "UI/UX Navigation", status: "REVIEWED", daysAgo: 12 },
    { content: "Beautiful charts and clean color palette. Really impressed by the polish.", channel: "App store review", customer: "Product Director", sentiment: "POS", score: 0.85, area: "UI/UX", theme: "UI/UX Navigation", status: "ACTIONED", daysAgo: 16 },
    { content: "Modal dialogs close when clicking outside accidentally, losing all typed draft feedback.", channel: "Support ticket", customer: "Feedback Lead", sentiment: "NEG", score: -0.7, area: "UI/UX", theme: "UI/UX Navigation", status: "NEW", daysAgo: 4 },

    // Enterprise SSO & Security
    { content: "Prospect wants SSO before they'll sign — third time this month. SAML 2.0 / Okta is mandatory for them.", channel: "Sales call note", customer: "Enterprise Account Exec", sentiment: "NEG", score: -0.85, area: "Enterprise", theme: "Enterprise SSO", status: "REVIEWED", daysAgo: 3 },
    { content: "Our security audit requires SCIM automated user provisioning and granular custom roles.", channel: "Sales call note", customer: "CISO (Global Media)", sentiment: "NEU", score: 0.0, area: "Enterprise", theme: "Enterprise SSO", status: "NEW", daysAgo: 7 },
    { content: "Need SOC2 Type II compliance report before we can expand to 200 seats.", channel: "Support ticket", customer: "Compliance Officer", sentiment: "NEU", score: 0.1, area: "Enterprise", theme: "Enterprise SSO", status: "REVIEWED", daysAgo: 14 },
    { content: "Two-factor authentication (2FA) enforcement at workspace level is critical for our team.", channel: "Community post", customer: "Security Eng", sentiment: "POS", score: 0.5, area: "Enterprise", theme: "Enterprise SSO", status: "NEW", daysAgo: 10 },
    { content: "Cannot restrict Viewer role from exporting customer PII data. We need field-level redaction.", channel: "NPS survey", customer: "Privacy Lead (FinTech)", sentiment: "NEG", score: -0.75, area: "Enterprise", theme: "Enterprise SSO", status: "NEW", daysAgo: 5 },

    // Integration & API
    { content: "The webhook payloads for new feedback are well documented and fired reliably within 50ms.", channel: "Community post", customer: "Developer (Zapier)", sentiment: "POS", score: 0.9, area: "Integrations", theme: "Integration & API", status: "ACTIONED", daysAgo: 21 },
    { content: "Zendesk integration stopped syncing ticket comments yesterday around 3 PM EST.", channel: "Support ticket", customer: "HelpDesk Lead", sentiment: "NEG", score: -0.8, area: "Integrations", theme: "Integration & API", status: "NEW", daysAgo: 1 },
    { content: "Would love a native Jira sync to convert actionable customer feedback directly into epics.", channel: "Sales call note", customer: "Director of Product", sentiment: "POS", score: 0.7, area: "Integrations", theme: "Integration & API", status: "REVIEWED", daysAgo: 13 },
    { content: "Slack integration notification channel needs filter by sentiment so our execs only get high-priority alerts.", channel: "Community post", customer: "Growth Lead", sentiment: "POS", score: 0.65, area: "Integrations", theme: "Integration & API", status: "ACTIONED", daysAgo: 17 },
    { content: "API rate limit is too restrictive (60 req/min) for our bulk migration script.", channel: "Support ticket", customer: "Data Architect", sentiment: "NEG", score: -0.6, area: "Integrations", theme: "Integration & API", status: "REVIEWED", daysAgo: 9 },

    // Mobile Experience
    { content: "It does the job, but the mobile experience needs work. Tables overflow the viewport on iPhone 15.", channel: "NPS survey", customer: "Mobile Reviewer", sentiment: "NEU", score: -0.2, area: "Mobile", theme: "Mobile Experience", status: "NEW", daysAgo: 6 },
    { content: "iOS widget for seeing daily feedback sentiment would be amazing for our product managers.", channel: "Community post", customer: "iOS Enthusiast", sentiment: "POS", score: 0.75, area: "Mobile", theme: "Mobile Experience", status: "NEW", daysAgo: 15 },
    { content: "Cannot view chart tooltips on touch devices — tapping selects the whole SVG container.", channel: "App store review", customer: "Tablet User", sentiment: "NEG", score: -0.55, area: "Mobile", theme: "Mobile Experience", status: "REVIEWED", daysAgo: 11 },
    { content: "Push notifications on Android for critical negative feedback are super timely and accurate.", channel: "App store review", customer: "On-Call Manager", sentiment: "POS", score: 0.85, area: "Mobile", theme: "Mobile Experience", status: "ACTIONED", daysAgo: 24 },

    // Export & Reporting
    { content: "Love the new export feature, saved me an hour today preparing the leadership deck.", channel: "Community post", customer: "VP Product (E-com)", sentiment: "POS", score: 0.95, area: "Reporting", theme: "Export & Reporting", status: "ACTIONED", daysAgo: 19 },
    { content: "Exported CSV encodes dates in UTC rather than the workspace configured timezone.", channel: "Support ticket", customer: "BI Analyst", sentiment: "NEG", score: -0.3, area: "Reporting", theme: "Export & Reporting", status: "NEW", daysAgo: 7 },
    { content: "Voice of Customer automated summary generated by AI was spot on and saved our team 4 hours of manual reading.", channel: "NPS survey", customer: "Head of Support", sentiment: "POS", score: 0.95, area: "Reporting", theme: "Export & Reporting", status: "ACTIONED", daysAgo: 16 },
    { content: "Need PDF export of the weekly trends chart with custom branding / logo option.", channel: "Sales call note", customer: "Agency Partner", sentiment: "POS", score: 0.6, area: "Reporting", theme: "Export & Reporting", status: "REVIEWED", daysAgo: 12 },
    { content: "Scheduled email digest should have an option to include positive customer testimonial quotes.", channel: "Community post", customer: "Marketing Director", sentiment: "POS", score: 0.7, area: "Reporting", theme: "Export & Reporting", status: "ACTIONED", daysAgo: 27 },
  ];

  // Expand with 35+ unique realistic templates across all themes
  const channels = ["Support ticket", "App store review", "NPS survey", "Sales call note", "Community post"];
  const companies = ["TechCorp", "CloudBase", "DataPulse", "Nexora", "Veritas Health", "StripeShop", "Apex Logistics", "OmniAI", "BlueShift", "AeroDynamics", "Zenith FinTech", "Quantum SaaS", "PulseMedia", "Nordic Retail", "Beacon Security"];
  
  const additionalTemplates = [
    // Billing & Invoicing
    { text: "Our finance team requires annual upfront invoicing with net-30 payment terms.", sent: "NEU", score: 0.0, area: "Billing", theme: "Billing & Invoicing" },
    { text: "Getting a 504 gateway timeout whenever I click download past invoices from the billing tab.", sent: "NEG", score: -0.9, area: "Billing", theme: "Billing & Invoicing" },
    { text: "Please add European VAT reverse-charge number support to our monthly invoice receipts.", sent: "NEG", score: -0.6, area: "Billing", theme: "Billing & Invoicing" },
    { text: "Upgraded our workspace from Starter to Growth tier instantly with zero plan sync interruption.", sent: "POS", score: 0.85, area: "Billing", theme: "Billing & Invoicing" },
    { text: "Credit card charge failed silently without sending a notification email to our billing admin.", sent: "NEG", score: -0.75, area: "Billing", theme: "Billing & Invoicing" },
    { text: "Need multi-currency billing in EUR and GBP instead of mandatory USD conversion fees.", sent: "NEU", score: -0.2, area: "Billing", theme: "Billing & Invoicing" },

    // Onboarding & Setup
    { text: "Team member invitation links expire after only 24 hours, causing repeated admin resends.", sent: "NEG", score: -0.65, area: "Onboarding", theme: "Onboarding & Setup" },
    { text: "The initial workspace setup checklist was super intuitive and guided us in under 5 minutes.", sent: "POS", score: 0.9, area: "Onboarding", theme: "Onboarding & Setup" },
    { text: "Accidentally closed the onboarding modal and cannot find a way to reopen the team invite step.", sent: "NEG", score: -0.55, area: "Onboarding", theme: "Onboarding & Setup" },
    { text: "Would love a CSV bulk invite option for adding 50+ engineers to our organization at once.", sent: "POS", score: 0.6, area: "Onboarding", theme: "Onboarding & Setup" },
    { text: "Cannot invite external agency reviewers without giving them full organization access.", sent: "NEG", score: -0.7, area: "Onboarding", theme: "Onboarding & Setup" },

    // Performance & Speed
    { text: "The speed of the query engine when filtering by channel and sentiment is blazingly fast.", sent: "POS", score: 0.8, area: "Performance", theme: "Performance & Speed" },
    { text: "Received a 502 Bad Gateway error when uploading a 5MB CSV file containing 4,000 feedback rows.", sent: "NEG", score: -0.85, area: "Performance", theme: "Performance & Speed" },
    { text: "Analytics dashboard loads in under 300ms even with 10,000 feedback points loaded.", sent: "POS", score: 0.92, area: "Performance", theme: "Performance & Speed" },
    { text: "The live table view stutters when rapidly scrolling through more than 500 rows.", sent: "NEG", score: -0.6, area: "Performance", theme: "Performance & Speed" },
    { text: "Instant search autocomplete makes finding relevant customer tickets effortless.", sent: "POS", score: 0.85, area: "Performance", theme: "Performance & Speed" },

    // Enterprise SSO & Security
    { text: "We need SAML 2.0 Okta single sign-on integration before our enterprise compliance team can sign.", sent: "NEG", score: -0.7, area: "Enterprise", theme: "Enterprise SSO" },
    { text: "SOC2 Type II compliance certification is a strict requirement for our annual enterprise contract.", sent: "NEU", score: 0.0, area: "Enterprise", theme: "Enterprise SSO" },
    { text: "Enforced two-factor authentication (2FA) across our workspace without any user friction.", sent: "POS", score: 0.88, area: "Enterprise", theme: "Enterprise SSO" },
    { text: "We require granular IP allowlisting for our remote analyst and admin team members.", sent: "NEU", score: 0.1, area: "Enterprise", theme: "Enterprise SSO" },
    { text: "Audit log does not record who downloaded the Voice-of-Customer PDF report.", sent: "NEG", score: -0.5, area: "Enterprise", theme: "Enterprise SSO" },

    // Mobile Experience
    { text: "Mobile web dashboard is hard to navigate on portrait tablet and iPad screens.", sent: "NEG", score: -0.45, area: "Mobile", theme: "Mobile Experience" },
    { text: "Loving the iOS mobile app; push alerts for critical negative spikes notify our on-call team.", sent: "POS", score: 0.9, area: "Mobile", theme: "Mobile Experience" },
    { text: "App crashes intermittently on iOS 17 when opening high-resolution chart drill-downs.", sent: "NEG", score: -0.8, area: "Mobile", theme: "Mobile Experience" },
    { text: "Mobile dark mode looks sleek and saves battery life during triage sessions.", sent: "POS", score: 0.82, area: "Mobile", theme: "Mobile Experience" },

    // Integrations & API
    { text: "API documentation for the feedback ingestion endpoint is crystal clear with ready curl samples.", sent: "POS", score: 0.84, area: "Integrations", theme: "Integration & API" },
    { text: "Zendesk webhook sync failed silently during yesterday's maintenance window.", sent: "NEG", score: -0.75, area: "Integrations", theme: "Integration & API" },
    { text: "Would love automated Slack channel alerts whenever customer negative sentiment exceeds 30%.", sent: "POS", score: 0.7, area: "Integrations", theme: "Integration & API" },
    { text: "Rate limit of 60 requests per minute is too restrictive for our historical data sync script.", sent: "NEG", score: -0.55, area: "Integrations", theme: "Integration & API" },

    // Export & Reporting
    { text: "The weekly AI executive report digest is fantastic for our Monday executive leadership standup.", sent: "POS", score: 0.95, area: "Reporting", theme: "Export & Reporting" },
    { text: "Exported CSV does not include the AI theme categorization confidence column.", sent: "NEG", score: -0.4, area: "Reporting", theme: "Export & Reporting" },
    { text: "PDF export layout is clean and ready for executive presentations without reformatting.", sent: "POS", score: 0.9, area: "Reporting", theme: "Export & Reporting" },

    // UI/UX Navigation
    { text: "Color-coded sentiment pills make it so easy to prioritize and triage critical bug reports.", sent: "POS", score: 0.8, area: "UI/UX", theme: "UI/UX Navigation" },
    { text: "Keyboard shortcut navigation between inbox rows would make triaging 5x faster.", sent: "POS", score: 0.65, area: "UI/UX", theme: "UI/UX Navigation" },
    { text: "Search filter reset button is too small and easily missed in the filter toolbar.", sent: "NEG", score: -0.35, area: "UI/UX", theme: "UI/UX Navigation" },
  ];

  const fullFeedbackList: any[] = [...rawFeedbackItems];

  for (let i = 0; i < 90; i++) {
    const template = additionalTemplates[i % additionalTemplates.length];
    const ch = channels[i % channels.length];
    const comp = companies[i % companies.length];
    const daysAgo = (i % 28) + 1;
    const statuses: Array<"NEW" | "REVIEWED" | "ACTIONED"> = ["NEW", "REVIEWED", "ACTIONED"];
    const status = statuses[i % 3];

    fullFeedbackList.push({
      content: template.text,
      channel: ch,
      customer: `${comp} User #${(i % 15) + 1}`,
      sentiment: template.sent,
      score: template.score,
      area: template.area,
      theme: template.theme,
      status,
      daysAgo,
    });
  }

  console.log(`Total feedback records to insert: ${fullFeedbackList.length}`);

  let insertedCount = 0;
  for (let i = 0; i < fullFeedbackList.length; i++) {
    const item = fullFeedbackList[i];
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - item.daysAgo);
    createdDate.setHours(createdDate.getHours() - (i % 12));

    const sourceRef = `${item.channel.slice(0, 3).toUpperCase()}-${1000 + i}`;
    const rationale = `Identified as ${item.sentiment} (${item.score > 0 ? "+" : ""}${item.score.toFixed(2)}) focused on ${item.area}.`;

    const feedback = await prisma.feedback.create({
      data: {
        content: item.content,
        channel: item.channel,
        sourceRef,
        customerLabel: item.customer,
        sentiment: item.sentiment,
        sentimentScore: item.score,
        status: item.status,
        featureArea: item.area,
        aiRationale: rationale,
        workspaceId: workspace.id,
        createdAt: createdDate,
        updatedAt: createdDate,
      },
    });

    // Link Theme
    const targetTheme = createdThemes[item.theme] || createdThemes["Onboarding & Setup"];
    if (targetTheme) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: feedback.id,
          themeId: targetTheme.id,
          confidence: Number((0.8 + (i % 18) * 0.01).toFixed(2)),
        },
      });
    }

    // Generate and store embedding vector
    const vector = generateEmbeddingVector(item.content);
    await prisma.embedding.create({
      data: {
        feedbackId: feedback.id,
        vector: JSON.stringify(vector),
        workspaceId: workspace.id,
        createdAt: createdDate,
      },
    });

    insertedCount++;
  }

  console.log(`[SEED] Successfully seeded ${insertedCount} feedback items with embeddings and theme associations.`);

  console.log("Generating demo Voice-of-Customer report...");
  const reportStartDate = new Date();
  reportStartDate.setDate(reportStartDate.getDate() - 30);
  const reportEndDate = new Date();

  const sampleReportJson = {
    executiveSummary: `During the last 30 days, Acme CloudScale captured 130+ customer feedback records across Support tickets, App Store reviews, NPS surveys, Sales call notes, and Community posts. Overall sentiment registered at 58% positive, 14% neutral, and 28% negative (+4.5% sentiment score improvement vs prior period).\n\nKey themes centered around Onboarding & Setup, Billing & Invoicing, Performance & Speed, and Enterprise SSO. Notably, 'Onboarding & Setup' saw a 60% increase in mentions relating to team invitations and permission friction.\n\nProduct leadership should urgently address team invitation UX and resolve billing PDF invoice download latency to safeguard activation and mid-market expansion.`,
    periodLabel: "Last 30 Days",
    metrics: {
      totalFeedback: insertedCount,
      positivePercentage: 58,
      neutralPercentage: 14,
      negativePercentage: 28,
      sentimentDelta: 4.5,
      topChannel: "Support ticket",
    },
    keyThemes: [
      { name: "Onboarding & Setup", count: 32, sentimentSummary: "Critical friction around team invites and user verification.", isSpiking: true, spikePercentage: 60 },
      { name: "Billing & Invoicing", count: 24, sentimentSummary: "Billing invoice download timeouts and VAT request backlog.", isSpiking: false },
      { name: "Performance & Speed", count: 22, sentimentSummary: "High praise for new UI speed; table rendering lag on large datasets.", isSpiking: false },
      { name: "Enterprise SSO", count: 18, sentimentSummary: "Mandatory requirement for 3 enterprise pipeline prospects.", isSpiking: true, spikePercentage: 45 },
    ],
    criticalFrictionPoints: [
      {
        area: "Onboarding & Team Invites",
        description: "Admins report confusion and expired links when onboarding colleagues to their workspace.",
        severity: "CRITICAL",
        evidenceQuote: "Onboarding took forever — I couldn't figure out how to invite my team.",
      },
      {
        area: "Billing Invoices & PDF Downloads",
        description: "Billing tab occasionally times out when downloading past monthly invoices.",
        severity: "HIGH",
        evidenceQuote: "Billing page keeps timing out when I try to download an invoice.",
      },
      {
        area: "Enterprise SSO & SAML Support",
        description: "Multiple enterprise buyers require SAML 2.0 / Okta authentication before contract signing.",
        severity: "HIGH",
        evidenceQuote: "Prospect wants SSO before they'll sign — third time this month.",
      },
    ],
    notableVerbatimQuotes: [
      {
        quote: "Onboarding took forever — I couldn't figure out how to invite my team.",
        channel: "Support ticket",
        customerLabel: "Sarah M. (FinTech)",
        sentiment: "NEG",
        theme: "Onboarding & Setup",
      },
      {
        quote: "The new dashboard is gorgeous and finally fast. Huge improvement over last release.",
        channel: "App store review",
        customerLabel: "Kevin T.",
        sentiment: "POS",
        theme: "Performance & Speed",
      },
      {
        quote: "Love the new export feature, saved me an hour today preparing the leadership deck.",
        channel: "Community post",
        customerLabel: "VP Product (E-com)",
        sentiment: "POS",
        theme: "Export & Reporting",
      },
      {
        quote: "Prospect wants SSO before they'll sign — third time this month.",
        channel: "Sales call note",
        customerLabel: "Enterprise Account Exec",
        sentiment: "NEG",
        theme: "Enterprise SSO",
      },
    ],
    strategicActionItems: [
      {
        priority: 1,
        title: "Overhaul Workspace Team Invitation Wizard",
        owner: "Product",
        recommendation: "Implement an in-app invite modal with magic links and multi-role assignment.",
        businessImpact: "Expected to boost Day-7 user activation by 22% and eliminate top support ticket driver.",
      },
      {
        priority: 2,
        title: "Optimize Billing PDF Invoice Generation",
        owner: "Engineering",
        recommendation: "Generate invoice PDFs asynchronously via background workers with CDN caching.",
        businessImpact: "Eliminates 100% of billing timeouts and prevents payment escalation tickets.",
      },
      {
        priority: 3,
        title: "Deliver Enterprise SAML / Okta SSO Connector",
        owner: "Engineering",
        recommendation: "Add SAML 2.0 single sign-on connector for Enterprise tier workspaces.",
        businessImpact: "Unblocks 3 pending enterprise deals worth $75k in pipeline ARR.",
      },
    ],
  };

  await prisma.report.create({
    data: {
      title: "Voice-of-Customer Monthly Intelligence Digest",
      periodStart: reportStartDate,
      periodEnd: reportEndDate,
      contentJson: JSON.stringify(sampleReportJson),
      workspaceId: workspace.id,
      generatedById: adminUser.id,
    },
  });

  console.log("[SEED] Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("[SEED ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

# Project LOOP — AI Customer Feedback Intelligence Platform

> **"Close the loop on customer feedback."**
> A corporate-grade, multi-tenant SaaS application that ingests multi-channel customer feedback, classifies sentiment and themes with AI, detects emerging trend spikes, provides retrieval-grounded Q&A, and generates executive Voice-of-Customer (VoC) intelligence reports.

---

## Key Features & Capabilities

### 1. Multi-Tenant Architecture & Role-Based Access Control (RBAC)
- **Tenant Isolation**: Every database entity (`Feedback`, `Theme`, `Embedding`, `Report`, `User`) is strictly scoped by `workspaceId`. Cross-tenant data leakage is prevented at every API boundary.
- **3 Distinct Roles**:
  - **Admin**: Full organizational control — manage members, assign roles, configure settings, ingest/triage feedback, and delete reports.
  - **Analyst**: Triage & ingestion — single entry, bulk CSV import, simulated channel sync, status workflow transitions (`NEW` → `REVIEWED` → `ACTIONED`), manual AI re-classification, and VoC report generation.
  - **Viewer**: Read-only access — explore live dashboards, view filtered inbox, browse theme trends, ask questions via Ask LOOP, and read VoC reports. (403 Forbidden is enforced server-side for any mutation attempt).

### 2. Multi-Channel Feedback Ingestion
- **Single Feedback Entry**: Real-time entry with metadata (channel, customer label, source ref).
- **Bulk CSV Upload**: Drag-and-drop file uploader with column parser, batch AI classification, and import summary report.
- **Simulated Channels**: 1-click simulated channel pulls from Zendesk tickets, App Store reviews, NPS surveys, Sales call notes, and Community posts.

### 3. Feedback Inbox & Triage Workflow
- **Server-Side Pagination & Search**: Fast full-text search across feedback text, customer labels, tickets, and feature areas.
- **Multi-Dimension Filters**: Filter dynamically by Channel, Sentiment (`POS`, `NEU`, `NEG`), Theme, Workflow Status, and Date ranges.
- **Interactive Slide-Over Drawer**: Inspect full verbatim feedback, AI rationale, sentiment score gauge (-1.0 to +1.0), theme confidence ratings, and trigger manual AI re-classification.

### 4. Interactive Analytics Dashboard
- **Executive Stat Cards**: Total Ingested Items, Negative Feedback %, Net Sentiment Index, and New Ingested This Week.
- **Recharts Visualizations**:
  - **Volume Over Time**: Interactive Area chart tracking positive, neutral, and critical items over selectable time intervals (7D, 14D, 30D, 90D).
  - **Sentiment Breakdown**: Donut chart with live percentage distribution.
  - **Top Themes Matrix**: Horizontal bar chart comparing mention volume vs. negative friction.
  - **Channel Sources**: Visual breakdown across all 5 customer touchpoints.

### 5. Theme Clustering & Spike Detection
- Automated theme grouping with count velocity calculations vs. prior periods.
- **Spike Warning Indicators** (`+60% Spike`): Early detection of emerging customer complaints and issues.
- **Theme Drill-Down**: Click any theme cluster to inspect all underlying customer quotes with sentiment scores and AI rationales.

### 6. "Ask LOOP" Retrieval-Grounded Q&A (RAG)
- Conversational plain-English query assistant (e.g. *"What are customers saying about onboarding?"*).
- **Zero-Hallucination Semantic Retrieval**: Vector embeddings search retrieves top-K relevant feedback items strictly within the authenticated workspace.
- **Interactive Source Citations**: Every answer includes clickable verification cards citing exact verbatim quotes, sentiment tags, and channel sources.

### 7. Automated Voice-of-Customer (VoC) Report Generator
- 1-click executive intelligence reports for custom periods (Weekly Sprint, Bi-weekly, Monthly, or Custom).
- Pre-computes key statistical aggregates in code, then synthesizes:
  1. Executive Summary & Customer Pulse
  2. Primary Theme Clusters & Velocity
  3. Critical Friction Points & Churn Drivers
  4. Notable Verbatim Customer Quotes
  5. Ranked Strategic Recommendations with assigned owners (Product, Engineering, Support).
- **Export & Print**: Clean, printable PDF export view and historical report archive.

---

## Demo Credentials Checklist

For instant testing of RBAC and tenant functionality, the database is pre-seeded with three demo accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@loop.dev` | `Password123!` | Full workspace administration & management |
| **Analyst** | `analyst@loop.dev` | `Password123!` | Ingestion, triage, re-classify, report generation |
| **Viewer** | `viewer@loop.dev` | `Password123!` | Read-only access to dashboards, inbox, & reports |

> **Quick Switcher**: Use the 1-Click Demo Login buttons on the `/login` page or the role selector in the top navigation bar to seamlessly test permissions without retyping credentials.

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) + TypeScript | Full-stack application architecture |
| **Styling** | Tailwind CSS + Lucide React | Modern dark glassmorphism SaaS UI |
| **Database** | PostgreSQL / SQLite + Prisma ORM | Multi-tenant schema with relations and constraints |
| **Authentication** | NextAuth.js (Auth.js) + bcryptjs | JWT session management & server-side RBAC guards |
| **AI Intelligence** | Anthropic Claude API (`@anthropic-ai/sdk`) | Structured classification, VoC reports, grounded Q&A |
| **Zero-Key Fallback**| Built-in NLP & Vector Engine | Reliable, high-accuracy offline operation |
| **Semantic Search** | Vector Embeddings + Cosine Similarity | Retrieval-Augmented Generation (RAG) for Ask LOOP |
| **Charts** | Recharts | Interactive volume, donut, and bar chart analytics |
| **Validation** | Zod | Runtime schema validation on every API boundary |

---

## System Architecture

```
Client Browser (Next.js 14 React Server & Client Components)
  │
  ▼
API Route Handlers (/api/*)
  ├── Auth & RBAC Guard (getTenantContext, checkRoleGuard)
  ├── Workspace Tenant Isolation (workspaceId scoping on all queries)
  └── Zod Runtime Input Validation
  │
  ├──► Anthropic Claude AI Engine / Local Smart NLP Fallback
  ├──► Vector Search Engine (64-dim Subword Cosine Similarity)
  └──► Prisma ORM
        └──► Database (Workspace, User, Feedback, Theme, FeedbackTheme, Embedding, Report)
```

---

## Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or newer (v20+ recommended)
- **npm** or **yarn**
- **Git**

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd loop
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Contents of `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="project_loop_super_secret_session_jwt_key_2026"
ANTHROPIC_API_KEY="" # Optional: Claude AI API key (built-in fallback works out of the box)
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
NODE_ENV="development"
```

### 4. Initialize Database & Seed Demo Data
```bash
# Push schema and generate Prisma client
npx prisma db push

# Seed 130+ multi-channel feedback records, themes, embeddings, and users
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Test Suite

Run the comprehensive test suite verifying database models, RBAC role guards, tenant isolation, AI classification, semantic vector retrieval, and VoC report generation:

```bash
npx ts-node test-platform.ts
```

All 17 automated tests will execute and report status.

---

## Repository Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # 1-Click demo logins & credentials form
│   │   └── signup/page.tsx          # Workspace & Admin registration
│   ├── (app)/
│   │   ├── layout.tsx               # App layout wrapper with AppShell
│   │   ├── dashboard/page.tsx       # KPI cards, Recharts analytics
│   │   ├── inbox/page.tsx           # Paginated inbox, drawer, CSV uploader
│   │   ├── trends/page.tsx          # Theme clustering & spike alerts
│   │   ├── ask/page.tsx             # Ask LOOP grounded Q&A with citations
│   │   ├── reports/page.tsx         # VoC executive reports & PDF export
│   │   └── settings/page.tsx        # Workspace management & team RBAC
│   ├── api/
│   │   ├── auth/[...nextauth]/      # NextAuth JWT route
│   │   ├── auth/register/           # User & workspace registration
│   │   ├── feedback/                # Feedback CRUD, search, and pagination
│   │   │   ├── [id]/                # Single item operations & status
│   │   │   │   └── reclassify/      # AI re-classification endpoint
│   │   │   ├── bulk/                # CSV bulk import parser & classifier
│   │   │   └── simulate/            # Simulated channel pulls
│   │   ├── themes/                  # Theme clustering & growth rates
│   │   ├── analytics/               # Dashboard stats & timeline data
│   │   ├── ask/                     # Semantic RAG grounded Q&A
│   │   ├── reports/                 # VoC report generation & retrieval
│   │   └── workspace/members/       # Teammate invitations & role updates
│   ├── globals.css                  # Design tokens, glassmorphism, print CSS
│   ├── layout.tsx                   # Root HTML layout with providers
│   └── page.tsx                     # Root redirect logic
├── components/
│   ├── AppShell.tsx                 # Navigation sidebar, role switcher, simulation
│   └── AuthProvider.tsx             # SessionProvider wrapper
├── lib/
│   ├── ai.ts                        # Claude AI client & local NLP engine
│   ├── auth.ts                      # Session helpers & server-side RBAC guards
│   ├── db.ts                        # Prisma client singleton
│   ├── search.ts                    # Vector embeddings & cosine similarity search
│   ├── types.ts                     # TypeScript domain models & interfaces
│   └── validations.ts               # Zod validation schemas
├── prisma/
│   ├── schema.prisma                # Multi-tenant relational schema
│   └── seed.ts                      # 130+ feedback items seed script
├── test-platform.ts                 # Automated platform verification suite
├── package.json
└── tsconfig.json
```

---

## Production Deployment

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import repository into [Vercel](https://vercel.com).
3. Connect a PostgreSQL database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)).
4. Configure environment variables in Vercel project settings:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `NEXTAUTH_SECRET` (Random secret key)
   - `NEXTAUTH_URL` (Production deployment URL)
   - `ANTHROPIC_API_KEY` (Optional Anthropic API key)
5. Set Build Command to:
   ```bash
   npx prisma generate && npx prisma db push && npm run seed && next build
   ```
6. Deploy!

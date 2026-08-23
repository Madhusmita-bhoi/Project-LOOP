// Type definitions for Project LOOP

export type Role = "ADMIN" | "ANALYST" | "VIEWER";

export type Sentiment = "POS" | "NEU" | "NEG";

export type FeedbackStatus = "NEW" | "REVIEWED" | "ACTIONED";

export type Channel =
  | "Support ticket"
  | "App store review"
  | "NPS survey"
  | "Sales call note"
  | "Community post";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  workspaceId: string;
  workspaceName?: string;
}

export interface FeedbackItem {
  id: string;
  content: string;
  channel: Channel | string;
  sourceRef?: string | null;
  customerLabel?: string | null;
  sentiment: Sentiment;
  sentimentScore: number;
  status: FeedbackStatus;
  featureArea?: string | null;
  aiRationale?: string | null;
  workspaceId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  themes?: Array<{
    theme: {
      id: string;
      name: string;
      color: string;
      description?: string | null;
    };
    confidence: number;
  }>;
}

export interface ThemeItem {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  workspaceId: string;
  count?: number;
  sentimentBreakdown?: {
    pos: number;
    neu: number;
    neg: number;
  };
  growthRate?: number; // e.g. +60% vs prior week
  isSpiking?: boolean;
}

export interface VoCReportContent {
  executiveSummary: string;
  periodLabel: string;
  metrics: {
    totalFeedback: number;
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
    sentimentDelta: number; // vs previous period
    topChannel: string;
  };
  keyThemes: Array<{
    name: string;
    count: number;
    sentimentSummary: string;
    isSpiking: boolean;
    spikePercentage?: number;
  }>;
  criticalFrictionPoints: Array<{
    area: string;
    description: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM";
    evidenceQuote: string;
  }>;
  notableVerbatimQuotes: Array<{
    quote: string;
    channel: string;
    customerLabel?: string;
    sentiment: Sentiment;
    theme: string;
  }>;
  strategicActionItems: Array<{
    priority: number;
    title: string;
    owner: "Product" | "Engineering" | "Customer Support" | "Leadership";
    recommendation: string;
    businessImpact: string;
  }>;
}

export interface AskLoopCitation {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string | null;
  sentiment: Sentiment;
  createdAt: string;
  similarityScore: number;
}

export interface AskLoopResponse {
  answer: string;
  citations: AskLoopCitation[];
  groundedFeedbackCount: number;
}

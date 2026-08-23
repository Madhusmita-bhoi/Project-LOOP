import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional().default("ADMIN"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const FeedbackCreateSchema = z.object({
  content: z.string().min(5, "Feedback content must be at least 5 characters"),
  channel: z.enum([
    "Support ticket",
    "App store review",
    "NPS survey",
    "Sales call note",
    "Community post",
  ]),
  sourceRef: z.string().optional().nullable(),
  customerLabel: z.string().optional().nullable(),
  createdAt: z.string().optional(),
});

export const FeedbackStatusUpdateSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]),
});

export const BulkImportRowSchema = z.object({
  content: z.string().min(3),
  channel: z.string().default("Support ticket"),
  customer_label: z.string().optional().nullable(),
  source_ref: z.string().optional().nullable(),
  created_at: z.string().optional(),
});

export const ThemeCreateSchema = z.object({
  name: z.string().min(2, "Theme name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Must be valid hex color").default("#6366f1"),
});

export const AskLoopQuerySchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters"),
  limit: z.number().min(1).max(20).default(8),
});

export const GenerateReportSchema = z.object({
  title: z.string().optional(),
  periodDays: z.number().min(1).max(90).default(30),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const MemberInviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).default("ANALYST"),
  password: z.string().min(6).default("Password123!"),
});

export const MemberRoleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

// AI Structured Output Schema
export const AIClassificationOutputSchema = z.object({
  sentiment: z.enum(["POS", "NEU", "NEG"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1),
  featureArea: z.string(),
  rationale: z.string(),
});

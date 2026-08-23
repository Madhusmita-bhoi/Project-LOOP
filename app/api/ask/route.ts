import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth";
import { AskLoopQuerySchema } from "@/lib/validations";
import { searchRelevantFeedback } from "@/lib/search";
import { generateGroundedAnswer } from "@/lib/ai";

// POST /api/ask: Ask LOOP retrieval-grounded Q&A
export async function POST(req: Request) {
  try {
    const { authenticated, workspaceId } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = AskLoopQuerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { question, limit } = parsed.data;

    // Step 1: Semantic vector retrieval over tenant's feedback items
    const citations = await searchRelevantFeedback(workspaceId, question, limit);

    // Step 2: Grounded answer generation using Claude AI (or local grounded synthesizer)
    const answer = await generateGroundedAnswer(question, citations);

    return NextResponse.json({
      question,
      answer,
      citations,
      groundedFeedbackCount: citations.length,
    });
  } catch (error: any) {
    console.error("POST /api/ask error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process question" },
      { status: 500 }
    );
  }
}

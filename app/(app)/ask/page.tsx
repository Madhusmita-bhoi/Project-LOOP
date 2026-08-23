"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  Search,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Tag,
  ArrowRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Zap,
} from "lucide-react";

interface Citation {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string | null;
  sentiment: "POS" | "NEU" | "NEG";
  createdAt: string;
  similarityScore: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  groundedCount?: number;
  timestamp: string;
}

function FormattedAnswer({ text }: { text: string }) {
  const paragraphs = text.split("\n\n").filter(Boolean);

  const scrollToCitation = (num: string) => {
    const el = document.getElementById(`citation-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-indigo-400", "scale-[1.02]");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-indigo-400", "scale-[1.02]");
      }, 2000);
    }
  };

  const renderInline = (str: string) => {
    // Clean up spacing around punctuation
    const cleanStr = str.replace(/\s+([.,;:])/g, "$1");
    const parts = cleanStr.split(/(\[#\d+\]|\*\*.*?\*\*)/g);

    return parts.map((part, i) => {
      if (/^\[#\d+\]$/.test(part)) {
        const num = part.replace(/[^\d]/g, "");
        return (
          <button
            key={i}
            onClick={() => scrollToCitation(num)}
            className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded bg-indigo-950/90 hover:bg-indigo-700/90 border border-indigo-500/50 text-indigo-300 text-[10px] font-mono font-bold transition hover:scale-105 cursor-pointer shadow-sm align-middle"
            title={`Jump to Citation #${num}`}
          >
            #{num}
          </button>
        );
      } else if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-indigo-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split("\n").filter(Boolean);

        // Check if paragraph is an Actionable / Recommendation block
        if (
          paragraph.startsWith("**Product Recommendation:**") ||
          paragraph.startsWith("**Strategic Recommendation:**") ||
          paragraph.startsWith("**Engineering Priority:**") ||
          paragraph.startsWith("**Strategic Impact:**") ||
          paragraph.startsWith("**Mobile Roadmap:**") ||
          paragraph.startsWith("**Performance Optimization:**") ||
          paragraph.startsWith("**Actionable Takeaway:**")
        ) {
          const colonIdx = paragraph.indexOf(":");
          const title = paragraph.slice(2, colonIdx).replace(/\*/g, "");
          const body = paragraph.slice(colonIdx + 1).trim();

          return (
            <div
              key={pIdx}
              className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-indigo-950/50 border border-indigo-500/30 shadow-md space-y-1.5 my-2"
            >
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Lightbulb className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{title}</span>
              </div>
              <div className="text-xs text-gray-200 leading-relaxed font-sans pl-6">
                {renderInline(body)}
              </div>
            </div>
          );
        }

        // Check if paragraph is a Section Header
        if (
          lines.length === 1 &&
          lines[0].startsWith("**") &&
          lines[0].endsWith("**")
        ) {
          const headerText = lines[0].slice(2, -2);
          const isFrictionHeader = /friction|pain|root cause|issues|problems/i.test(headerText);
          const isPraiseHeader = /positive|highlights|strengths|satisfaction/i.test(headerText);

          return (
            <div key={pIdx} className="pt-2 pb-1 border-b border-gray-800/80 flex items-center gap-2">
              {isFrictionHeader ? (
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              ) : isPraiseHeader ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
              )}
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${
                  isFrictionHeader
                    ? "text-rose-300"
                    : isPraiseHeader
                    ? "text-emerald-300"
                    : "text-indigo-300"
                }`}
              >
                {headerText}
              </h3>
            </div>
          );
        }

        // Check if paragraph is a list (numbered 1. 2. or bulleted • -)
        const isList = lines.some(
          (l) =>
            /^\s*\d+\.\s*/.test(l) ||
            /^\s*[•\-]\s*/.test(l)
        );

        if (isList) {
          return (
            <div key={pIdx} className="space-y-2.5 my-1">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();

                // Numbered list item: 1. **Title**: Body
                const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
                if (numMatch) {
                  const num = numMatch[1];
                  const content = numMatch[2];

                  return (
                    <div
                      key={lIdx}
                      className="p-3 rounded-xl bg-gray-900/70 border border-gray-800/80 flex items-start gap-3 hover:border-gray-700/80 transition"
                    >
                      <div className="h-5 w-5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {num}
                      </div>
                      <div className="text-xs text-gray-200 leading-relaxed font-sans flex-1">
                        {renderInline(content)}
                      </div>
                    </div>
                  );
                }

                // Bulleted list item: • **Title**: Body
                if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                  const itemText = trimmed.replace(/^[•\-]\s*/, "");
                  return (
                    <div
                      key={lIdx}
                      className="p-3 rounded-xl bg-gray-900/70 border border-gray-800/80 flex items-start gap-3 hover:border-gray-700/80 transition"
                    >
                      <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <div className="text-xs text-gray-200 leading-relaxed font-sans flex-1">
                        {renderInline(itemText)}
                      </div>
                    </div>
                  );
                }

                // Subtitle inside list
                if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                  return (
                    <p key={lIdx} className="font-bold text-xs uppercase tracking-wider text-indigo-300 pt-1">
                      {trimmed.slice(2, -2)}
                    </p>
                  );
                }

                return (
                  <p key={lIdx} className="text-xs text-gray-200 leading-relaxed">
                    {renderInline(line)}
                  </p>
                );
              })}
            </div>
          );
        }

        // Standard narrative paragraph (Executive Lead / Context)
        return (
          <p key={pIdx} className="text-xs text-gray-200 leading-relaxed font-sans">
            {renderInline(paragraph)}
          </p>
        );
      })}
    </div>
  );
}

export default function AskLoopPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am **Ask LOOP**, your grounded AI customer intelligence assistant.\n\nAsk me anything in plain English about what your customers are saying, complaining about, or requesting. Every answer I generate is 100% grounded in your workspace's actual ingested feedback with direct source citations.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const sampleQuestions = [
    "What are users saying about onboarding & team invites?",
    "Why are customers experiencing issues on the billing page?",
    "What are the main enterprise features customers are requesting?",
    "How do users feel about the platform speed and performance?",
    "What feedback are we getting from mobile and iOS app users?",
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, limit: 6 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get answer");

      const botMsg: ChatMessage = {
        role: "assistant",
        content: data.answer,
        citations: data.citations || [],
        groundedCount: data.groundedFeedbackCount || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message || "Failed to process query"}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Ask LOOP</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              RAG Grounded Q&A
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Query customer feedback in plain English. Answers are strictly synthesized from retrieved evidence.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Tenant Isolated & Anti-Hallucination Grounded</span>
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-indigo-400" />
          <span>Suggested Questions to Try:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleAsk(sq)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/40 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-left disabled:opacity-50"
            >
              <span>{sq}</span>
              <ArrowRight className="h-3 w-3 text-indigo-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border transition ${
              msg.role === "user"
                ? "bg-indigo-950/30 border-indigo-500/40 ml-8 sm:ml-16"
                : "glass-panel border-gray-800/80 mr-4 sm:mr-8"
            }`}
          >
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center space-x-2">
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white"
                  }`}
                >
                  {msg.role === "user" ? "U" : "∞"}
                </div>
                <span className="font-bold text-gray-200">
                  {msg.role === "user" ? "You" : "Ask LOOP Engine"}
                </span>
                {msg.groundedCount !== undefined && msg.groundedCount > 0 && (
                  <span className="text-[10px] font-medium bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Grounded in {msg.groundedCount} feedback items
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500 font-mono">{msg.timestamp}</span>
            </div>

            {/* Formatted Markdown/Text Body */}
            <div className="text-xs text-gray-200 leading-relaxed font-sans space-y-2">
              <FormattedAnswer text={msg.content} />
            </div>

            {/* Grounded Citation Source Cards */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-800/80 space-y-3">
                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Cited Customer Feedback Context ({msg.citations.length} sources)</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {msg.citations.map((c, cIdx) => (
                    <div
                      id={`citation-${cIdx + 1}`}
                      key={c.id}
                      className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2 hover:border-indigo-500/50 hover:bg-gray-850 transition"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                            #{cIdx + 1}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-medium">
                            {c.channel}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            c.sentiment === "POS"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : c.sentiment === "NEG"
                              ? "bg-rose-500/15 text-rose-300"
                              : "bg-slate-500/15 text-slate-300"
                          }`}
                        >
                          {c.sentiment}
                        </span>
                      </div>

                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        "{c.content}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800/60 font-mono">
                        <span className="truncate">{c.customerLabel || "Customer"}</span>
                        <span>Relevance: {Math.round(c.similarityScore * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="glass-panel p-5 rounded-2xl border border-gray-800/80 flex items-center space-x-3 text-xs text-indigo-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Retrieving semantic embeddings and synthesizing grounded answer...</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="glass-panel p-2 rounded-2xl border border-gray-700/80 shadow-lg flex items-center space-x-2 mt-6"
      >
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your customer feedback..."
            className="w-full pl-10 pr-4 py-3 bg-transparent text-xs text-gray-100 placeholder-gray-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 disabled:opacity-40 transition flex items-center justify-center cursor-pointer"
          title="Send Question"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

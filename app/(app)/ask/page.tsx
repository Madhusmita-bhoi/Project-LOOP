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
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  User,
} from "lucide-react";
import AudioBriefingButton from "@/components/AudioBriefingButton";

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
  // Strip any inline [#N] or [N] bracket tokens completely
  const cleanText = text
    .replace(/\[#?\d+\]/g, "")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();

  const paragraphs = cleanText.split("\n\n").filter(Boolean);

  const renderInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-3 font-sans text-sm text-gray-200 leading-relaxed">
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split("\n").filter(Boolean);
        const isBulletList = lines.some((l) => /^\s*[\-•]\s*/.test(l));

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-2 my-2 pl-1">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
                  const content = trimmed.replace(/^[\-•]\s*/, "");
                  return (
                    <li key={lIdx} className="flex items-start gap-2.5 text-gray-200">
                      <span className="text-indigo-400 font-bold leading-relaxed select-none">•</span>
                      <div className="flex-1 leading-relaxed">{renderInline(content)}</div>
                    </li>
                  );
                }
                return (
                  <p key={lIdx} className="text-gray-200 leading-relaxed">
                    {renderInline(line)}
                  </p>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} className="text-gray-200 leading-relaxed">
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
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I am **Ask LOOP**, your grounded AI customer intelligence assistant.\n\nAsk me anything in plain English about what your customers are saying, complaining about, or requesting. Every answer I generate is 100% grounded in your workspace's actual ingested feedback with direct source citations.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const toggleSources = (msgIdx: number) => {
    setExpandedSources((prev) => ({ ...prev, [msgIdx]: !prev[msgIdx] }));
  };

  const handleCopyAnswer = (idx: number, text: string) => {
    const clean = text.replace(/\[#?\d+\]/g, "").trim();
    navigator.clipboard.writeText(clean);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I am **Ask LOOP**, your grounded AI customer intelligence assistant.\n\nAsk me anything in plain English about what your customers are saying, complaining about, or requesting. Every answer I generate is 100% grounded in your workspace's actual ingested feedback with direct source citations.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setExpandedSources({});
  };

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

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Anti-Hallucination Grounded</span>
          </div>

          <button
            onClick={handleClearChat}
            disabled={messages.length <= 1 || loading}
            className="px-3 py-1.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
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
              className="text-xs px-3 py-1.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/40 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-left disabled:opacity-50 cursor-pointer"
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
                  {msg.role === "user" ? (
                    <User className="h-3 w-3" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
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

              <div className="flex items-center space-x-2">
                {msg.role === "assistant" && (
                  <>
                    <AudioBriefingButton text={msg.content} label="Listen" />
                    <button
                      onClick={() => handleCopyAnswer(idx, msg.content)}
                      className="px-2 py-1 rounded-md bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-gray-200 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                      title="Copy Answer"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </>
                )}
                <span className="text-[10px] text-gray-500 font-mono">{msg.timestamp}</span>
              </div>
            </div>

            {/* Formatted Markdown/Text Body */}
            <div className="text-xs text-gray-200 leading-relaxed font-sans space-y-2">
              <FormattedAnswer text={msg.content} />
            </div>

            {/* Collapsible Grounded Citation Source Accordion */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-800/60">
                <button
                  type="button"
                  onClick={() => toggleSources(idx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs text-gray-400 hover:text-gray-200 transition cursor-pointer"
                >
                  <Tag className="h-3 w-3 text-indigo-400" />
                  <span className="font-medium">
                    {expandedSources[idx]
                      ? `Hide ${msg.citations.length} Cited Sources`
                      : `View ${msg.citations.length} Cited Sources`}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                      expandedSources[idx] ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>

                {/* Collapsible Source Cards Container */}
                {expandedSources[idx] && (
                  <div className="mt-3.5 space-y-2.5">
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

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Sparkles,
  FileText,
  Settings,
  Plus,
  Upload,
  Zap,
  ArrowRight,
  Shield,
  X,
  Command,
} from "lucide-react";

interface CommandItem {
  id: string;
  category: "Navigation" | "Quick Actions" | "AI Workflows" | "Demo Personas";
  title: string;
  subtitle?: string;
  icon: any;
  shortcut?: string;
  action: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = [
    // Navigation
    {
      id: "nav-dash",
      category: "Navigation",
      title: "Intelligence Dashboard",
      subtitle: "View real-time feedback metrics, sentiment score, and spiking trends",
      icon: LayoutDashboard,
      shortcut: "G D",
      action: () => {
        router.push("/dashboard");
        onClose();
      },
    },
    {
      id: "nav-inbox",
      category: "Navigation",
      title: "Feedback Inbox",
      subtitle: "Search, filter, and triage customer feedback items",
      icon: Inbox,
      shortcut: "G I",
      action: () => {
        router.push("/inbox");
        onClose();
      },
    },
    {
      id: "nav-trends",
      category: "Navigation",
      title: "Theme Trends & Spike Velocity",
      subtitle: "Explore AI theme clusters and anomaly growth detection",
      icon: TrendingUp,
      shortcut: "G T",
      action: () => {
        router.push("/trends");
        onClose();
      },
    },
    {
      id: "nav-ask",
      category: "Navigation",
      title: "Ask LOOP (Grounded AI Q&A)",
      subtitle: "Query customer intelligence in plain English with citations",
      icon: Sparkles,
      shortcut: "G A",
      action: () => {
        router.push("/ask");
        onClose();
      },
    },
    {
      id: "nav-reports",
      category: "Navigation",
      title: "Voice-of-Customer (VoC) Reports",
      subtitle: "Generate executive digests and export PDF reports",
      icon: FileText,
      shortcut: "G R",
      action: () => {
        router.push("/reports");
        onClose();
      },
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Workspace & Team Settings",
      subtitle: "Manage team members, roles, webhook keys, and workspace profile",
      icon: Settings,
      shortcut: "G S",
      action: () => {
        router.push("/settings");
        onClose();
      },
    },

    // Quick Actions
    {
      id: "act-add-feedback",
      category: "Quick Actions",
      title: "Add Single Customer Feedback",
      subtitle: "Ingest a new feedback item with auto AI classification",
      icon: Plus,
      action: () => {
        router.push("/inbox");
        onClose();
      },
    },
    {
      id: "act-import-csv",
      category: "Quick Actions",
      title: "Import Bulk Feedback CSV",
      subtitle: "Upload and batch classify hundreds of feedback records",
      icon: Upload,
      action: () => {
        router.push("/inbox");
        onClose();
      },
    },
    {
      id: "act-generate-report",
      category: "AI Workflows",
      title: "Generate New VoC Executive Digest",
      subtitle: "Synthesize critical friction points and roadmap recommendations",
      icon: Sparkles,
      action: () => {
        router.push("/reports");
        onClose();
      },
    },
    {
      id: "act-ask-onboarding",
      category: "AI Workflows",
      title: "Ask LOOP: 'What are users saying about onboarding?'",
      subtitle: "Instant AI synthesis for team setup & invitation issues",
      icon: Sparkles,
      action: () => {
        router.push("/ask");
        onClose();
      },
    },
    {
      id: "act-ask-billing",
      category: "AI Workflows",
      title: "Ask LOOP: 'Why are customers having issues on billing?'",
      subtitle: "Instant AI synthesis for invoice timeouts & payment renewals",
      icon: Sparkles,
      action: () => {
        router.push("/ask");
        onClose();
      },
    },
  ];

  const filteredItems = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-black/70 backdrop-blur-md flex items-start justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0f1422] border border-gray-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-800/80 bg-gray-900/60">
          <Search className="h-5 w-5 text-indigo-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, or search query (e.g. 'Dashboard', 'Billing', 'CSV')..."
            className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-gray-500 bg-gray-800/80 border border-gray-700/50 ml-2">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-gray-800/30">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              <p className="font-semibold text-gray-300">No commands matching "{query}"</p>
              <p className="text-gray-500 mt-1">Try searching for a page name, action, or theme.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-indigo-600/20 border border-indigo-500/40 text-white"
                      : "hover:bg-gray-800/40 text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                          : "bg-gray-800/80 text-gray-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 border border-gray-700/50">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="hidden sm:inline font-mono text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight
                      className={`h-3.5 w-3.5 transition-transform ${
                        isSelected ? "text-indigo-400 translate-x-0.5" : "text-gray-600"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="p-3 border-t border-gray-800/80 bg-gray-950/70 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono text-[10px]">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>

          <div className="flex items-center gap-1 text-indigo-400 font-medium">
            <Sparkles className="h-3 w-3" />
            <span>LOOP Command Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}

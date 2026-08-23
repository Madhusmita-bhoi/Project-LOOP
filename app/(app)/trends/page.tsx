"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Flame,
  Tag,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  X,
  MessageSquare,
  AlertTriangle,
  Smile,
  Calendar,
} from "lucide-react";

export default function TrendsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isViewer = user?.role === "VIEWER";

  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [selectedTheme, setSelectedTheme] = useState<any | null>(null);
  const [themeFeedbacks, setThemeFeedbacks] = useState<any[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Theme Form
  const [themeForm, setThemeForm] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  });
  const [creating, setCreating] = useState(false);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/themes?days=${days}`);
      const json = await res.json();
      if (res.ok) setThemes(json.data || []);
    } catch (e) {
      console.error("Failed to load themes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [days]);

  // Drill down into theme feedback
  const handleDrillDown = async (theme: any) => {
    setSelectedTheme(theme);
    setDrillLoading(true);
    try {
      const res = await fetch(`/api/feedback?themeId=${theme.id}&limit=50`);
      const json = await res.json();
      if (res.ok) setThemeFeedbacks(json.data || []);
    } catch (e) {
      console.error("Failed to drill down theme", e);
    } finally {
      setDrillLoading(false);
    }
  };

  // Create new custom theme
  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    setCreating(true);
    try {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(themeForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create theme");

      setCreateModalOpen(false);
      setThemeForm({ name: "", description: "", color: "#6366f1" });
      fetchThemes();
    } catch (err: any) {
      alert(err.message || "Failed to create theme");
    } finally {
      setCreating(false);
    }
  };

  const spikingThemes = themes.filter((t) => t.isSpiking);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Theme Clustering & Spike Velocity
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            AI-extracted themes, volume growth trends, and early warning anomaly detection
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Period Selector */}
          <div className="flex items-center bg-gray-900/90 border border-gray-800 rounded-xl p-1 text-xs">
            <Calendar className="h-3.5 w-3.5 text-gray-400 ml-2 mr-1" />
            {[
              { label: "7D", val: 7 },
              { label: "14D", val: 14 },
              { label: "30D", val: 30 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setDays(p.val)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  days === p.val
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            disabled={isViewer}
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 disabled:opacity-40 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Theme</span>
          </button>
        </div>
      </div>

      {/* Spike Alert Banner if spiking themes exist */}
      {spikingThemes.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 shadow-xl flex items-start justify-between gap-3 animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Spike Warning: Emerging Feedback Clusters Detected
              </p>
              <p className="text-xs text-gray-300 mt-1">
                The following themes experienced a notable surge in customer mentions over the selected period:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {spikingThemes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleDrillDown(st)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-900/60 px-1 rounded">
                      +{st.growthRate}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-xs">Computing theme clusters and growth velocity...</p>
          </div>
        ) : themes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            <p className="text-sm font-semibold">No themes registered</p>
          </div>
        ) : (
          themes.map((theme) => {
            const total = theme.recentCount || theme.count || 1;
            const posPct = Math.round(((theme.sentimentBreakdown?.pos || 0) / total) * 100);
            const negPct = Math.round(((theme.sentimentBreakdown?.neg || 0) / total) * 100);
            const neuPct = Math.max(0, 100 - posPct - negPct);

            return (
              <div
                key={theme.id}
                onClick={() => handleDrillDown(theme)}
                className="glass-panel glass-panel-hover p-5 rounded-2xl border border-gray-800/80 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Spike Indicator */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide truncate"
                      style={{
                        backgroundColor: `${theme.color}20`,
                        color: theme.color,
                        border: `1px solid ${theme.color}40`,
                      }}
                    >
                      {theme.name}
                    </span>

                    {theme.isSpiking ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        <span>+{theme.growthRate}% Spike</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-gray-400">
                        {theme.growthRate >= 0 ? `+${theme.growthRate}%` : `${theme.growthRate}%`} vs prior
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px]">
                    {theme.description || "Aggregated customer feedback topics and mentions."}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-3">
                  {/* Volume & Net Sentiment */}
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Volume</span>
                      <p className="text-base font-bold text-white mt-0.5">
                        {theme.count}{" "}
                        <span className="text-[11px] font-normal text-gray-400">
                          ({theme.recentCount} in {days}d)
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">
                        Net Score
                      </span>
                      <p
                        className={`text-base font-bold mt-0.5 font-mono ${
                          theme.avgSentimentScore >= 0.2
                            ? "text-emerald-400"
                            : theme.avgSentimentScore <= -0.2
                            ? "text-rose-400"
                            : "text-gray-300"
                        }`}
                      >
                        {theme.avgSentimentScore > 0 ? "+" : ""}
                        {theme.avgSentimentScore}
                      </p>
                    </div>
                  </div>

                  {/* Sentiment Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span className="text-emerald-400 font-semibold">{posPct}% Pos</span>
                      <span className="text-gray-400">{neuPct}% Neu</span>
                      <span className="text-rose-400 font-semibold">{negPct}% Neg</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full flex overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${posPct}%` }} />
                      <div className="bg-gray-500 h-full" style={{ width: `${neuPct}%` }} />
                      <div className="bg-rose-500 h-full" style={{ width: `${negPct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-indigo-400 pt-1 font-semibold">
                    <span>Drill into feedback items</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Theme Feedback Drill-down Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl max-w-3xl w-full border border-gray-700 shadow-2xl space-y-4 max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <span
                  className="px-3 py-1 rounded-lg text-sm font-bold"
                  style={{
                    backgroundColor: `${selectedTheme.color}20`,
                    color: selectedTheme.color,
                    border: `1px solid ${selectedTheme.color}50`,
                  }}
                >
                  {selectedTheme.name}
                </span>
                <span className="text-xs text-gray-400">
                  {themeFeedbacks.length} Feedback Records
                </span>
              </div>
              <button onClick={() => setSelectedTheme(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {drillLoading ? (
                <div className="py-12 text-center text-gray-400">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-400" />
                  <span>Loading linked customer feedback...</span>
                </div>
              ) : themeFeedbacks.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  No feedback records assigned to this theme.
                </div>
              ) : (
                themeFeedbacks.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-medium">
                          {f.channel}
                        </span>
                        <span className="text-gray-300 font-medium">{f.customerLabel || "User"}</span>
                      </div>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                          f.sentiment === "POS"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : f.sentiment === "NEG"
                            ? "bg-rose-500/15 text-rose-300"
                            : "bg-slate-500/15 text-slate-300"
                        }`}
                      >
                        {f.sentiment} ({f.sentimentScore > 0 ? "+" : ""}{f.sentimentScore})
                      </span>
                    </div>

                    <p className="text-gray-200 text-xs leading-relaxed">"{f.content}"</p>

                    {f.aiRationale && (
                      <p className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-800/60">
                        AI Rationale: {f.aiRationale}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedTheme(null)}
                className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
              >
                Close Drilldown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Theme Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-400" />
                Create New Theme
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTheme} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Theme Name *</label>
                <input
                  type="text"
                  required
                  value={themeForm.name}
                  onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                  placeholder="e.g. Workflow Automation"
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={themeForm.description}
                  onChange={(e) => setThemeForm({ ...themeForm, description: e.target.value })}
                  placeholder="Brief description of what customer feedback belongs here..."
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Theme Badge Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={themeForm.color}
                    onChange={(e) => setThemeForm({ ...themeForm, color: e.target.value })}
                    className="h-8 w-12 bg-transparent border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeForm.color}
                    onChange={(e) => setThemeForm({ ...themeForm, color: e.target.value })}
                    className="w-28 p-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Theme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  AlertTriangle,
  Smile,
  Calendar,
  Filter,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  Inbox,
} from "lucide-react";

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const [channel, setChannel] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}&channel=${channel}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, channel]);

  const stats = data?.stats;
  const charts = data?.charts;

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Intelligence Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time customer feedback metrics, sentiment distribution, and emerging theme spikes
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2">
          {/* Period Selector */}
          <div className="flex items-center bg-gray-900/90 border border-gray-800 rounded-xl p-1 text-xs">
            <Calendar className="h-3.5 w-3.5 text-gray-400 ml-2 mr-1" />
            {[
              { label: "7D", val: 7 },
              { label: "14D", val: 14 },
              { label: "30D", val: 30 },
              { label: "90D", val: 90 },
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

          {/* Channel Dropdown */}
          <div className="relative">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="bg-gray-900/90 border border-gray-800 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="ALL">All Channels</option>
              <option value="Support ticket">Support tickets</option>
              <option value="App store review">App Store reviews</option>
              <option value="NPS survey">NPS surveys</option>
              <option value="Sales call note">Sales call notes</option>
              <option value="Community post">Community posts</option>
            </select>
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-gray-900/90 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Ingested
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {loading ? "..." : stats?.totalFeedback || 0}
            </span>
            {stats?.totalGrowthPct !== undefined && (
              <span
                className={`text-xs font-semibold flex items-center ${
                  stats.totalGrowthPct >= 0 ? "text-emerald-400" : "text-gray-400"
                }`}
              >
                {stats.totalGrowthPct >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
                )}
                {stats.totalGrowthPct >= 0 ? `+${stats.totalGrowthPct}%` : `${stats.totalGrowthPct}%`}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">vs. previous {days} days</p>
        </div>

        {/* Negative Feedback % */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Negative Feedback
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400">
              {loading ? "..." : `${stats?.negativePercentage || 0}%`}
            </span>
            {stats?.negPctDelta !== undefined && (
              <span
                className={`text-xs font-semibold flex items-center ${
                  stats.negPctDelta <= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {stats.negPctDelta > 0 ? `+${stats.negPctDelta}%` : `${stats.negPctDelta}%`}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            {stats?.negPctDelta > 0 ? "Spike alert vs prior period" : "Stable customer friction rate"}
          </p>
        </div>

        {/* Net Sentiment Score */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Net Sentiment Index
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Smile className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {loading
                ? "..."
                : `${stats?.netSentimentScore > 0 ? "+" : ""}${stats?.netSentimentScore || 0}`}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                stats?.netSentimentScore >= 0.2
                  ? "bg-emerald-500/15 text-emerald-300"
                  : stats?.netSentimentScore <= -0.2
                  ? "bg-rose-500/15 text-rose-300"
                  : "bg-amber-500/15 text-amber-300"
              }`}
            >
              {stats?.netSentimentScore >= 0.2
                ? "Positive"
                : stats?.netSentimentScore <= -0.2
                ? "Critical"
                : "Neutral"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Scale from -1.0 to +1.0</p>
        </div>

        {/* New Ingested This Week */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              New This Week
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {loading ? "..." : stats?.newThisWeek || 0}
            </span>
            <span className="text-xs text-indigo-400 font-medium">
              {stats?.activeThemesCount || 8} Active Themes
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Auto-classified on ingestion</p>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Volume Over Time (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-gray-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                Feedback Volume Over Time
              </h3>
              <p className="text-[11px] text-gray-400">
                Timeline breakdown of incoming positive, neutral, and critical items
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Pos
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span> Neu
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span> Neg
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {charts?.volumeTimeline && charts.volumeTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.volumeTimeline}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f3f4f6",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pos"
                    name="Positive"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="neu"
                    name="Neutral"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="neg"
                    name="Negative"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNeg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                No timeline data available for this range
              </div>
            )}
          </div>
        </div>

        {/* 2. Sentiment Breakdown Donut (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-100">Sentiment Distribution</h3>
            <p className="text-[11px] text-gray-400">Classified ratio across active feedback</p>
          </div>

          <div className="h-52 w-full my-2">
            {charts?.sentimentBreakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.sentimentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.sentimentBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800/80 text-center">
            {charts?.sentimentBreakdown?.map((item: any) => (
              <div key={item.name} className="p-1.5 rounded-lg bg-gray-800/40">
                <p className="text-[10px] text-gray-400 font-medium">{item.name}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: item.color }}>
                  {item.percentage}%
                </p>
                <p className="text-[10px] text-gray-500 font-mono">({item.value})</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Grid: Top Themes & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Themes Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-gray-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                Top Themes by Volume & Criticality
              </h3>
              <p className="text-[11px] text-gray-400">
                Ranked frequency of customer conversation topics and negative mention concentration
              </p>
            </div>
            <Link
              href="/trends"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>View Trends</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-60 w-full">
            {charts?.topThemes && charts.topThemes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.topThemes}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f3f4f6",
                    }}
                  />
                  <Bar dataKey="count" name="Total Mentions" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="negCount" name="Negative Mentions" fill="#f43f5e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                No theme data available
              </div>
            )}
          </div>
        </div>

        {/* Channel Ingestion Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-100">Channel Sources</h3>
            <p className="text-[11px] text-gray-400">Incoming feedback volume by channel</p>
          </div>

          <div className="space-y-3 my-3">
            {charts?.channelDistribution?.map((ch: any) => {
              const total = stats?.totalFeedback || 1;
              const pct = Math.round((ch.value / total) * 100);
              return (
                <div key={ch.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">{ch.name}</span>
                    <span className="text-gray-400 font-mono">
                      {ch.value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-800">
            <Link
              href="/ask"
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600/30 to-violet-600/30 hover:from-indigo-600/40 hover:to-violet-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Ask AI About Feedback Patterns</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

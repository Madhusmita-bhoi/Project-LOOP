"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Quote,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { VoCReportContent } from "@/lib/types";

export default function ReportsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isViewer = user?.role === "VIEWER";
  const isAdmin = user?.role === "ADMIN";

  const [reports, setReports] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const [periodDays, setPeriodDays] = useState(30);
  const [customTitle, setCustomTitle] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (res.ok) {
        setReports(json.data || []);
        if (json.data && json.data.length > 0 && !activeReport) {
          setActiveReport(json.data[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load reports", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodDays,
          title: customTitle || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate report");

      setGenerateModalOpen(false);
      setCustomTitle("");
      fetchReports();
      setActiveReport(json.data);
    } catch (err: any) {
      alert(err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to delete this saved report?")) return;

    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        if (activeReport?.id === reportId) {
          setActiveReport(reports.find((r) => r.id !== reportId) || null);
        }
      }
    } catch (e) {
      alert("Failed to delete report");
    }
  };

  let reportContent: VoCReportContent | null = null;
  if (activeReport?.contentJson) {
    try {
      reportContent = JSON.parse(activeReport.contentJson);
    } catch {
      reportContent = null;
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Voice-of-Customer (VoC) Intelligence Reports
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Executive-grade weekly & monthly syntheses, friction points, verbatim quotes, and strategic roadmaps
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeReport && (
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Print / Save as PDF"
            >
              <Printer className="h-3.5 w-3.5 text-indigo-400" />
              <span>Export PDF</span>
            </button>
          )}

          <button
            disabled={isViewer}
            onClick={() => setGenerateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 disabled:opacity-40 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Report Selector & Right Executive Document */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Saved Reports Archive (hidden on print) */}
        <div className="no-print lg:col-span-1 space-y-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Saved Reports Archive ({reports.length})
          </p>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-indigo-400" />
                <span>Loading reports...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-4 rounded-xl glass-panel text-center text-xs text-gray-400">
                No reports generated yet. Click Generate New Report to synthesize your feedback.
              </div>
            ) : (
              reports.map((rep) => {
                const isSelected = activeReport?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setActiveReport(rep)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-left relative group ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/50 shadow-md"
                        : "glass-panel border-gray-800/80 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900/40">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(rep.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition"
                          title="Delete Report"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-200 mt-1.5 line-clamp-2">
                      {rep.title}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      By {rep.generatedBy?.name || "AI Engine"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Executive Report Document View */}
        <div className="lg:col-span-3">
          {activeReport && reportContent ? (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800/80 shadow-2xl space-y-8 print:p-0 print:border-none print:shadow-none bg-[#0f1422]">
              {/* Document Header */}
              <div className="border-b border-gray-800 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                    <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">
                      Voice-of-Customer Intelligence Brief
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    Generated: {new Date(activeReport.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
                  {activeReport.title}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Scope: {reportContent.periodLabel} • Prepared for Executive & Product Leadership
                </p>
              </div>

              {/* KPI Snapshot Bar */}
              {reportContent.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Total Analyzed</span>
                    <p className="text-lg font-black text-white mt-0.5">
                      {reportContent.metrics.totalFeedback} items
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Positive Sentiment</span>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">
                      {reportContent.metrics.positivePercentage}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Negative Friction</span>
                    <p className="text-lg font-black text-rose-400 mt-0.5">
                      {reportContent.metrics.negativePercentage}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Sentiment Velocity</span>
                    <p
                      className={`text-lg font-black mt-0.5 ${
                        reportContent.metrics.sentimentDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {reportContent.metrics.sentimentDelta >= 0 ? "+" : ""}
                      {reportContent.metrics.sentimentDelta}% vs prior
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  1. Executive Summary & Customer Pulse
                </h3>
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                  {reportContent.executiveSummary}
                </div>
              </div>

              {/* 2. Key Theme Analysis */}
              {reportContent.keyThemes && reportContent.keyThemes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Tag className="h-4 w-4" />
                    2. Primary Theme Clusters & Velocity
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {reportContent.keyThemes.map((t, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-100">{t.name}</span>
                          {t.isSpiking ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Spike (+{t.spikePercentage || 50}%)
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-mono">{t.count} mentions</span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{t.sentimentSummary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Critical Friction Points */}
              {reportContent.criticalFrictionPoints && reportContent.criticalFrictionPoints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    3. Critical Friction Points & Churn Drivers
                  </h3>
                  <div className="space-y-2.5">
                    {reportContent.criticalFrictionPoints.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-300 text-xs">{f.area}</span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                              f.severity === "CRITICAL"
                                ? "bg-rose-600 text-white"
                                : "bg-rose-900/60 text-rose-300"
                            }`}
                          >
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{f.description}</p>
                        {f.evidenceQuote && (
                          <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 text-[11px] text-gray-300 italic flex items-start gap-2">
                            <Quote className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>"{f.evidenceQuote}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Verbatim Customer Quotes */}
              {reportContent.notableVerbatimQuotes && reportContent.notableVerbatimQuotes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Quote className="h-4 w-4" />
                    4. Notable Verbatim Customer Quotes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reportContent.notableVerbatimQuotes.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 space-y-2 text-xs flex flex-col justify-between"
                      >
                        <p className="text-gray-200 italic leading-relaxed">"{q.quote}"</p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-800">
                          <span>{q.customerLabel || q.channel}</span>
                          <span
                            className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                              q.sentiment === "POS"
                                ? "text-emerald-400 bg-emerald-950/50"
                                : q.sentiment === "NEG"
                                ? "text-rose-400 bg-rose-950/50"
                                : "text-gray-400"
                            }`}
                          >
                            {q.sentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Strategic Action Items */}
              {reportContent.strategicActionItems && reportContent.strategicActionItems.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    5. Ranked Strategic Recommendations
                  </h3>
                  <div className="space-y-2.5">
                    {reportContent.strategicActionItems.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/30 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                              {act.priority || idx + 1}
                            </span>
                            <span className="font-bold text-gray-100 text-xs">{act.title}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                            Owner: {act.owner}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          <strong>Action:</strong> {act.recommendation}
                        </p>
                        {act.businessImpact && (
                          <p className="text-emerald-300 text-[11px]">
                            <strong>Expected Impact:</strong> {act.businessImpact}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-gray-800 text-center text-gray-400 text-xs">
              Select a report from the archive or generate a new one to view.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Generate Report */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Generate Voice-of-Customer Report
              </h3>
              <button onClick={() => setGenerateModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Time Period Range</label>
                <select
                  value={periodDays}
                  onChange={(e) => setPeriodDays(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={7}>Last 7 Days (Weekly Sprint Digest)</option>
                  <option value={14}>Last 14 Days (Bi-weekly Pulse)</option>
                  <option value={30}>Last 30 Days (Monthly Intelligence Report)</option>
                  <option value={60}>Last 60 Days (Quarterly Lookback)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Custom Report Title (Optional)</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Q3 Customer Sentiment & Churn Analysis"
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>
                  LOOP will compute statistical aggregates in code, then synthesize an executive-level narrative with prioritized actions.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Synthesizing VoC Report...</span>
                    </>
                  ) : (
                    "Generate VoC Report"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

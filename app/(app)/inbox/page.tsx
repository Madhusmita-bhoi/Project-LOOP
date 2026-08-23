"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Filter,
  Plus,
  Upload,
  Zap,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  FileSpreadsheet,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Copy,
  Check,
} from "lucide-react";

export default function InboxPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const userRole = user?.role || "VIEWER";
  const isViewer = userRole === "VIEWER";

  // View Mode: 'table' vs 'cards'
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Data & Pagination State
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalCount: 0,
    totalPages: 1,
  });

  // Filter States
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("ALL");
  const [sentiment, setSentiment] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [themeId, setThemeId] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals & Drawer States
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Single Item Form State
  const [singleForm, setSingleForm] = useState({
    content: "",
    channel: "Support ticket",
    customerLabel: "",
    sourceRef: "",
  });
  const [singleSubmitting, setSingleSubmitting] = useState(false);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvSummary, setCsvSummary] = useState<any | null>(null);

  // Fetch Themes for Dropdown
  const fetchThemes = async () => {
    try {
      const res = await fetch("/api/themes");
      const json = await res.json();
      if (res.ok) setThemes(json.data || []);
    } catch (e) {
      console.error("Failed to load themes", e);
    }
  };

  // Fetch Feedback Items
  const fetchFeedback = async (pageToFetch = pagination.page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.append("search", search);
      if (channel !== "ALL") params.append("channel", channel);
      if (sentiment !== "ALL") params.append("sentiment", sentiment);
      if (status !== "ALL") params.append("status", status);
      if (themeId !== "ALL") params.append("themeId", themeId);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setFeedbackList(json.data || []);
        setPagination(json.pagination || { page: 1, limit: 15, totalCount: 0, totalPages: 1 });
      }
    } catch (e) {
      console.error("Failed to fetch feedback", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  useEffect(() => {
    fetchFeedback(1);
  }, [search, channel, sentiment, status, themeId, dateFrom, dateTo]);

  // Handle inline status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    if (isViewer) {
      alert("Viewers have read-only access. You cannot update status.");
      return;
    }

    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setFeedbackList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedItem?.id === id) {
        setSelectedItem((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  // Handle AI Re-classification
  const handleReclassify = async () => {
    if (!selectedItem || isViewer) return;
    setReclassifying(true);
    try {
      const res = await fetch(`/api/feedback/${selectedItem.id}/reclassify`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Re-classification failed");

      setSelectedItem(json.data);
      setFeedbackList((prev) =>
        prev.map((item) => (item.id === selectedItem.id ? json.data : item))
      );
      setActionSuccessMessage("AI Re-classification applied successfully!");
      setTimeout(() => setActionSuccessMessage(null), 3500);
      fetchThemes();
    } catch (err: any) {
      alert(err.message || "Failed to re-classify");
    } finally {
      setReclassifying(false);
    }
  };

  // Submit Single Feedback Form
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    setSingleSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create feedback");

      setSingleModalOpen(false);
      setSingleForm({ content: "", channel: "Support ticket", customerLabel: "", sourceRef: "" });
      fetchFeedback(1);
      fetchThemes();
      setActionSuccessMessage("Feedback ingested and classified with AI!");
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to ingest feedback");
    } finally {
      setSingleSubmitting(false);
    }
  };

  // Handle CSV file selection and parsing
  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const parsedRows = [];

      for (let i = 1; i < lines.length; i++) {
        // basic CSV comma regex split
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
          v.replace(/^"|"$/g, "").trim()
        );
        if (values.length > 0 && values[0]) {
          parsedRows.push({
            content: values[0] || "",
            channel: values[1] || "Support ticket",
            customer_label: values[2] || "Imported User",
            source_ref: values[3] || `CSV-${1000 + i}`,
          });
        }
      }
      setCsvPreview(parsedRows);
    };
    reader.readAsText(file);
  };

  // Submit CSV Bulk Ingestion
  const handleCsvImportSubmit = async () => {
    if (csvPreview.length === 0 || isViewer) return;
    setCsvImporting(true);
    setCsvSummary(null);

    try {
      const res = await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: csvPreview }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "CSV Bulk import failed");

      setCsvSummary(json.summary);
      fetchFeedback(1);
      fetchThemes();
    } catch (err: any) {
      alert(err.message || "CSV bulk import failed");
    } finally {
      setCsvImporting(false);
    }
  };

  // Download Sample CSV
  const downloadSampleCsv = () => {
    const csvContent =
      "content,channel,customer_label,source_ref\n" +
      '"Onboarding took forever — I could not figure out how to invite my team.",Support ticket,Sarah M. (FinTech),TICK-4912\n' +
      '"The new dashboard is gorgeous and blazingly fast. Huge improvement.",App store review,Kevin T.,APP-819\n' +
      '"Prospect wants SSO before they will sign — third time this month.",Sales call note,Enterprise Exec,SALES-202\n' +
      '"Billing page keeps timing out when I try to download an invoice.",Support ticket,Accountant,TICK-5021\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_feedback_loop.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Current Filtered Feedback to CSV
  const exportCurrentViewCsv = () => {
    if (feedbackList.length === 0) return;
    const headers = ["ID", "Content", "Customer", "Channel", "Sentiment", "SentimentScore", "FeatureArea", "Status", "CreatedAt"];
    const rows = feedbackList.map((f) => [
      `"${f.id}"`,
      `"${(f.content || "").replace(/"/g, '""')}"`,
      `"${(f.customerLabel || "").replace(/"/g, '""')}"`,
      `"${f.channel}"`,
      `"${f.sentiment}"`,
      f.sentimentScore || 0,
      `"${f.featureArea || ""}"`,
      `"${f.status}"`,
      `"${f.createdAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `loop_feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionSuccessMessage(`Exported ${feedbackList.length} feedback records to CSV!`);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  // Handle Quick Copy
  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-14 right-8 z-50 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Page Header & Ingestion Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Feedback Inbox
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Search, filter, and triage multi-channel feedback with AI classification and theme linkages
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                viewMode === "cards"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={exportCurrentViewCsv}
            disabled={feedbackList.length === 0}
            className="px-3 py-2 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            disabled={isViewer}
            onClick={() => {
              setCsvSummary(null);
              setCsvFile(null);
              setCsvPreview([]);
              setCsvModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 text-gray-200 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-indigo-400" />
            <span>Import CSV</span>
          </button>

          <button
            disabled={isViewer}
            onClick={() => setSingleModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 disabled:opacity-40 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Feedback</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800/80 space-y-3">
        {/* Row 1: Search bar */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback text, customer labels, tickets, or feature areas..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/90 border border-gray-700/80 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Row 2: Dropdown Multi-filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {/* Channel */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-1">
              Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Channels</option>
              <option value="Support ticket">Support tickets</option>
              <option value="App store review">App Store reviews</option>
              <option value="NPS survey">NPS surveys</option>
              <option value="Sales call note">Sales call notes</option>
              <option value="Community post">Community posts</option>
            </select>
          </div>

          {/* Sentiment */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-1">
              Sentiment
            </label>
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POS">Positive</option>
              <option value="NEU">Neutral</option>
              <option value="NEG">Negative</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-1">
              Status Workflow
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="ACTIONED">ACTIONED</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-1">
              Theme
            </label>
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Themes</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setChannel("ALL");
                setSentiment("ALL");
                setStatus("ALL");
                setThemeId("ALL");
                setDateFrom("");
                setDateTo("");
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition font-medium text-center"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Stream Container (Table vs Card View) */}
      {viewMode === "table" ? (
        <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0d121f] text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Feedback & Customer</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-3">Sentiment</th>
                  <th className="py-3 px-3">Themes</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                        <span>Loading feedback stream...</span>
                      </div>
                    </td>
                  </tr>
                ) : feedbackList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <p className="text-sm font-medium text-gray-300">No feedback matching your filters</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Try clearing filters or simulate a live channel pull from the sidebar.
                      </p>
                    </td>
                  </tr>
                ) : (
                  feedbackList.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setDrawerOpen(true);
                      }}
                      className="hover:bg-indigo-950/20 cursor-pointer transition group"
                    >
                      {/* Content & Customer */}
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-gray-200 line-clamp-2 font-normal leading-relaxed">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                          <span className="font-medium text-gray-300 truncate">
                            {item.customerLabel || "Anonymous Customer"}
                          </span>
                          {item.sourceRef && (
                            <span className="font-mono text-[10px] text-indigo-400/80 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/40">
                              {item.sourceRef}
                            </span>
                          )}
                          {item.featureArea && (
                            <span className="text-[10px] text-gray-400">
                              • Area: <strong className="text-gray-300">{item.featureArea}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-gray-800/80 text-gray-300 border border-gray-700/50">
                          {item.channel}
                        </span>
                      </td>

                      {/* Sentiment */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            item.sentiment === "POS"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : item.sentiment === "NEG"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              : "bg-slate-500/15 text-slate-300 border border-slate-500/30"
                          }`}
                        >
                          {item.sentiment === "POS" ? "POS +" : item.sentiment === "NEG" ? "NEG -" : "NEU ~"}
                          {Math.abs(item.sentimentScore).toFixed(2)}
                        </span>
                      </td>

                      {/* Themes */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {item.themes && item.themes.length > 0 ? (
                            item.themes.map((ft: any) => (
                              <span
                                key={ft.theme.id}
                                className="px-2 py-0.5 rounded text-[10px] font-medium truncate"
                                style={{
                                  backgroundColor: `${ft.theme.color}20`,
                                  color: ft.theme.color,
                                  borderColor: `${ft.theme.color}40`,
                                }}
                              >
                                {ft.theme.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-600 text-[10px] italic">Unassigned</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td
                        className="py-3.5 px-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          disabled={isViewer}
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`text-[10px] font-semibold rounded-md px-2 py-1 border transition bg-transparent focus:outline-none ${
                            item.status === "NEW"
                              ? "border-blue-500/40 text-blue-300 bg-blue-500/10"
                              : item.status === "TRIAGED"
                              ? "border-purple-500/40 text-purple-300 bg-purple-500/10"
                              : item.status === "ACTIONED"
                              ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                              : "border-gray-600 text-gray-400 bg-gray-800/40"
                          }`}
                        >
                          <option value="NEW" className="bg-gray-900 text-gray-200">
                            NEW
                          </option>
                          <option value="TRIAGED" className="bg-gray-900 text-gray-200">
                            TRIAGED
                          </option>
                          <option value="ACTIONED" className="bg-gray-900 text-gray-200">
                            ACTIONED
                          </option>
                          <option value="CLOSED" className="bg-gray-900 text-gray-200">
                            CLOSED
                          </option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap text-gray-500 font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 border-t border-gray-800 bg-[#0c101c] flex items-center justify-between text-xs text-gray-400">
            <div>
              Showing{" "}
              <span className="font-semibold text-gray-200">
                {pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-200">
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
              </span>{" "}
              of <span className="font-semibold text-gray-200">{pagination.totalCount}</span> items
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchFeedback(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-gray-300 font-mono">
                Page {pagination.page} / {pagination.totalPages || 1}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => fetchFeedback(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-12 text-center text-gray-400 glass-panel rounded-2xl">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400 mx-auto mb-2" />
                <span>Loading feedback stream...</span>
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 glass-panel rounded-2xl">
                <p className="text-sm font-medium text-gray-300">No feedback matching your filters</p>
                <p className="text-xs text-gray-500 mt-1">Try clearing filters or simulate new items.</p>
              </div>
            ) : (
              feedbackList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setDrawerOpen(true);
                  }}
                  className="glass-panel p-4 rounded-2xl border border-gray-800/80 hover:border-indigo-500/40 hover:bg-gray-850/60 transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-lg"
                >
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-center justify-between text-[11px] mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md font-medium bg-gray-800/90 text-gray-300 border border-gray-700/50">
                          {item.channel}
                        </span>
                        {item.sourceRef && (
                          <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900/50">
                            {item.sourceRef}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            item.sentiment === "POS"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : item.sentiment === "NEG"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              : "bg-slate-500/15 text-slate-300 border border-slate-500/30"
                          }`}
                        >
                          {item.sentiment} {Math.abs(item.sentimentScore).toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => handleCopy(item.id, item.content, e)}
                          className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                          title="Copy Quote"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Feedback Text */}
                    <p className="text-gray-200 text-xs leading-relaxed line-clamp-3">
                      "{item.content}"
                    </p>
                  </div>

                  {/* Bottom Themes & Status */}
                  <div className="pt-2.5 border-t border-gray-800/70 space-y-2 text-[10px]">
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="truncate font-medium text-gray-300">
                        {item.customerLabel || "Anonymous Customer"}
                      </span>
                      <span className="font-mono text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {item.themes && item.themes.length > 0 ? (
                          item.themes.slice(0, 2).map((ft: any) => (
                            <span
                              key={ft.theme.id}
                              className="px-1.5 py-0.2 rounded text-[9px] font-medium"
                              style={{
                                backgroundColor: `${ft.theme.color}20`,
                                color: ft.theme.color,
                              }}
                            >
                              {ft.theme.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-600 italic">No theme</span>
                        )}
                      </div>

                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[9px] ${
                          item.status === "NEW"
                            ? "bg-blue-500/10 text-blue-300"
                            : item.status === "TRIAGED"
                            ? "bg-purple-500/10 text-purple-300"
                            : item.status === "ACTIONED"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cards Pagination Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <div>
              Showing{" "}
              <span className="font-semibold text-gray-200">
                {pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-200">
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
              </span>{" "}
              of <span className="font-semibold text-gray-200">{pagination.totalCount}</span> items
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchFeedback(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-gray-300 font-mono">
                Page {pagination.page} / {pagination.totalPages || 1}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => fetchFeedback(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      {drawerOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#0f1422] border-l border-gray-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-800 text-gray-200 border border-gray-700">
                    {selectedItem.channel}
                  </span>
                  {selectedItem.sourceRef && (
                    <span className="font-mono text-xs text-indigo-400">
                      {selectedItem.sourceRef}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Feedback Content */}
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Raw Customer Feedback
                </label>
                <div className="mt-2 p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-100 leading-relaxed font-sans">
                  "{selectedItem.content}"
                </div>
              </div>

              {/* Customer & Timestamp metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                  <p className="text-gray-500 text-[10px] uppercase font-semibold">Customer</p>
                  <p className="text-gray-200 font-medium mt-0.5">
                    {selectedItem.customerLabel || "Anonymous"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                  <p className="text-gray-500 text-[10px] uppercase font-semibold">Captured Date</p>
                  <p className="text-gray-200 font-medium mt-0.5">
                    {new Date(selectedItem.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* AI Classification Details */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      AI Classification Breakdown
                    </span>
                  </div>
                  <button
                    disabled={reclassifying || isViewer}
                    onClick={handleReclassify}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-[11px] font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
                  >
                    <RefreshCw className={`h-3 w-3 ${reclassifying ? "animate-spin" : ""}`} />
                    <span>{reclassifying ? "Re-evaluating..." : "Re-classify with AI"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-[10px] text-gray-400">Sentiment Score:</span>
                    <p
                      className={`text-sm font-bold mt-0.5 ${
                        selectedItem.sentiment === "POS"
                          ? "text-emerald-400"
                          : selectedItem.sentiment === "NEG"
                          ? "text-rose-400"
                          : "text-gray-300"
                      }`}
                    >
                      {selectedItem.sentiment} ({selectedItem.sentimentScore > 0 ? "+" : ""}
                      {selectedItem.sentimentScore})
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Feature Area:</span>
                    <p className="text-sm font-bold text-gray-200 mt-0.5">
                      {selectedItem.featureArea || "General"}
                    </p>
                  </div>
                </div>

                {selectedItem.aiRationale && (
                  <div className="pt-2 border-t border-indigo-500/20">
                    <span className="text-[10px] text-gray-400">AI Rationale:</span>
                    <p className="text-xs text-gray-300 mt-0.5 italic">
                      {selectedItem.aiRationale}
                    </p>
                  </div>
                )}
              </div>

              {/* Linked Themes */}
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Associated Themes
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedItem.themes?.map((ft: any) => (
                    <div
                      key={ft.theme.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2"
                      style={{
                        backgroundColor: `${ft.theme.color}20`,
                        color: ft.theme.color,
                        border: `1px solid ${ft.theme.color}50`,
                      }}
                    >
                      <Tag className="h-3 w-3" />
                      <span>{ft.theme.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({Math.round(ft.confidence * 100)}% conf)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Control */}
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Workflow Triage Status
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["NEW", "REVIEWED", "ACTIONED"].map((s) => (
                    <button
                      key={s}
                      disabled={isViewer}
                      onClick={() => handleStatusChange(selectedItem.id, s)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                        selectedItem.status === s
                          ? s === "ACTIONED"
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                            : s === "REVIEWED"
                            ? "bg-blue-600 text-white border-blue-500 shadow-md"
                            : "bg-amber-600 text-white border-amber-500 shadow-md"
                          : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Single Feedback Ingestion */}
      {singleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-400" />
                Ingest Customer Feedback
              </h3>
              <button
                onClick={() => setSingleModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Feedback Content *</label>
                <textarea
                  required
                  rows={4}
                  value={singleForm.content}
                  onChange={(e) => setSingleForm({ ...singleForm, content: e.target.value })}
                  placeholder="Enter verbatim customer quote or support message..."
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Channel Source *</label>
                  <select
                    value={singleForm.channel}
                    onChange={(e) => setSingleForm({ ...singleForm, channel: e.target.value })}
                    className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Support ticket">Support ticket</option>
                    <option value="App store review">App store review</option>
                    <option value="NPS survey">NPS survey</option>
                    <option value="Sales call note">Sales call note</option>
                    <option value="Community post">Community post</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Customer Label</label>
                  <input
                    type="text"
                    value={singleForm.customerLabel}
                    onChange={(e) => setSingleForm({ ...singleForm, customerLabel: e.target.value })}
                    placeholder="e.g. Alex (Enterprise Tier)"
                    className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>AI will automatically classify sentiment, score, and themes upon save.</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={singleSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {singleSubmitting ? "Ingesting & Classifying..." : "Save & Classify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: CSV Bulk Importer */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-xl w-full border border-gray-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
                Bulk CSV Feedback Importer
              </h3>
              <button onClick={() => setCsvModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!csvSummary ? (
              <div className="space-y-4 text-xs">
                <div className="p-6 border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl text-center bg-gray-900/50">
                  <Upload className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-200">Select or drop feedback CSV</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Columns: <code>content, channel, customer_label, source_ref</code>
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvSelect}
                    className="mt-3 block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                </div>

                {csvPreview.length > 0 && (
                  <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 max-h-40 overflow-y-auto">
                    <p className="font-semibold text-gray-300 mb-2">
                      Detected {csvPreview.length} rows to import:
                    </p>
                    <ul className="space-y-1 text-[11px] text-gray-400">
                      {csvPreview.slice(0, 3).map((r, i) => (
                        <li key={i} className="truncate">
                          #{i + 1}: "{r.content}" ({r.channel})
                        </li>
                      ))}
                      {csvPreview.length > 3 && (
                        <li className="text-indigo-400">...and {csvPreview.length - 3} more rows</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setCsvModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={csvPreview.length === 0 || csvImporting}
                    onClick={handleCsvImportSubmit}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
                  >
                    {csvImporting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Processing & Classifying Rows...</span>
                      </>
                    ) : (
                      `Import ${csvPreview.length} Records`
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Success Summary Report */
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span>Import Complete!</span>
                  </div>
                  <p className="mt-2 text-xs">
                    Successfully imported and classified{" "}
                    <strong>{csvSummary.importedCount}</strong> customer feedback records.
                  </p>
                  {csvSummary.failedCount > 0 && (
                    <p className="mt-1 text-rose-300">
                      Failed rows: {csvSummary.failedCount}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setCsvModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                  >
                    Done & Refresh Inbox
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

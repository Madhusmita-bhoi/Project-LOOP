"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Sparkles,
  FileText,
  Settings,
  LogOut,
  Zap,
  Building2,
  Shield,
  Menu,
  X,
  RefreshCw,
  Layers,
  ChevronDown,
  UserCheck,
  Search,
} from "lucide-react";
import CommandPalette from "./CommandPalette";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  const user = session?.user as any;
  const userRole = user?.role || "VIEWER";
  const workspaceName = user?.workspaceName || "Acme CloudScale Inc.";

  // Global Command+K Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Feedback Inbox", href: "/inbox", icon: Inbox },
    { label: "Theme Trends", href: "/trends", icon: TrendingUp },
    { label: "Ask LOOP (AI Q&A)", href: "/ask", icon: Sparkles, badge: "AI" },
    { label: "VoC Reports", href: "/reports", icon: FileText },
    { label: "Workspace & Team", href: "/settings", icon: Settings },
  ];

  const handleSimulateSync = async (channel: string) => {
    if (userRole === "VIEWER") {
      alert("Role restriction: Viewers have read-only access and cannot ingest feedback.");
      return;
    }

    setSimulating(true);
    setSimMessage(null);
    try {
      const res = await fetch("/api/feedback/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, count: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");
      setSimMessage(`Synced 4 items from ${channel}`);
      setTimeout(() => setSimMessage(null), 4000);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to simulate channel sync");
    } finally {
      setSimulating(false);
    }
  };

  const handleQuickRoleSwitch = async (email: string) => {
    await signIn("credentials", {
      email,
      password: "Password123!",
      redirect: false,
    });
    router.refresh();
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <div className="flex items-center space-x-3 text-indigo-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium tracking-wide">Loading workspace session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0b0f19] text-gray-100 flex flex-col md:flex-row overflow-hidden">
      {/* Global Command Palette Modal */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* Top Mobile Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800/80 bg-[#111827]/90 backdrop-blur shrink-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            ∞
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-indigo-300 bg-clip-text text-transparent">
            LOOP
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            title="Open Command Palette"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-64 h-full border-r border-gray-800/70 bg-[#0f1422]/95 backdrop-blur shrink-0 z-40 overflow-hidden select-none`}
      >
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-gray-800/70 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
              ∞
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-white">LOOP</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400">Customer Feedback Intel</p>
            </div>
          </div>

          {/* Active Tenant / Workspace Card */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 border border-gray-700/50">
            <div className="flex items-center space-x-2 truncate">
              <Building2 className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-200 truncate">
                {workspaceName}
              </span>
            </div>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Active
            </span>
          </div>

          {/* Quick Search / Command Bar Trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs text-gray-400 hover:text-gray-200 transition group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-gray-500 group-hover:text-indigo-400 transition" />
              <span>Search or Command...</span>
            </div>
            <span className="font-mono text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
              ⌘K
            </span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm"
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Quick Simulation Section */}
          <div className="pt-4 mt-4 border-t border-gray-800/70 px-1">
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase mb-2 flex items-center justify-between">
              <span>Simulate Ingestion</span>
              <Zap className="h-3 w-3 text-amber-400" />
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                disabled={simulating || userRole === "VIEWER"}
                onClick={() => handleSimulateSync("Support ticket")}
                className="text-[11px] p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-40 text-left truncate transition font-medium"
                title="Sync Zendesk Tickets"
              >
                Support Tickets
              </button>
              <button
                disabled={simulating || userRole === "VIEWER"}
                onClick={() => handleSimulateSync("App store review")}
                className="text-[11px] p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-40 text-left truncate transition font-medium"
                title="Pull App Store Reviews"
              >
                App Store
              </button>
              <button
                disabled={simulating || userRole === "VIEWER"}
                onClick={() => handleSimulateSync("NPS survey")}
                className="text-[11px] p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-40 text-left truncate transition font-medium"
                title="Fetch NPS Survey Responses"
              >
                NPS Surveys
              </button>
              <button
                disabled={simulating || userRole === "VIEWER"}
                onClick={() => handleSimulateSync("Sales call note")}
                className="text-[11px] p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-40 text-left truncate transition font-medium"
                title="Ingest Sales Notes"
              >
                Sales Notes
              </button>
            </div>
            {simMessage && (
              <p className="mt-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-1.5 rounded animate-pulse">
                {simMessage}
              </p>
            )}
          </div>
        </nav>

        {/* User profile & RBAC pill */}
        <div className="p-3.5 border-t border-gray-800/70 bg-[#0c101c]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || "Anonymous"}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || "user@loop.dev"}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 text-gray-400 hover:text-rose-400 rounded-md hover:bg-gray-800/60 transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-gray-400">Role:</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                userRole === "ADMIN"
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  : userRole === "ANALYST"
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              }`}
            >
              {userRole}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Demo RBAC Bar */}
        <header className="no-print bg-[#111827]/80 border-b border-gray-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 z-20">
          <div className="flex items-center space-x-2 text-gray-300">
            <UserCheck className="h-4 w-4 text-indigo-400" />
            <span className="text-gray-400">Quick Demo Switcher:</span>
            <div className="inline-flex rounded-md shadow-sm space-x-1">
              <button
                onClick={() => handleQuickRoleSwitch("admin@loop.dev")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  user?.email === "admin@loop.dev"
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-gray-800/80 hover:bg-gray-700 text-gray-300"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => handleQuickRoleSwitch("analyst@loop.dev")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  user?.email === "analyst@loop.dev"
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-gray-800/80 hover:bg-gray-700 text-gray-300"
                }`}
              >
                Analyst
              </button>
              <button
                onClick={() => handleQuickRoleSwitch("viewer@loop.dev")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  user?.email === "viewer@loop.dev"
                    ? "bg-amber-600 text-white font-bold"
                    : "bg-gray-800/80 hover:bg-gray-700 text-gray-300"
                }`}
              >
                Viewer (Read-only)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400 text-[11px]">
            <span className="hidden sm:inline">
              Tenant Scope: <code className="text-indigo-300">{user?.workspaceId?.slice(0, 10) || "workspace"}...</code>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Isolated</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

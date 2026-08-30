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
  Search,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import CommandPalette from "./CommandPalette";
import LoopLogo from "./LoopLogo";

export default function AppShell({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: any;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  const activeSession = session || initialSession;
  const user = activeSession?.user as any;
  const userRole = user?.role || "ADMIN";
  const workspaceName = user?.workspaceName || "Acme CloudScale Inc.";
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const handleSwitchRole = async (targetEmail: string) => {
    if (switchingRole) return;
    setSwitchingRole(true);
    try {
      await signIn("credentials", {
        email: targetEmail,
        password: "Password123!",
        redirect: false,
      });
      setRoleDropdownOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to switch demo role", err);
    } finally {
      setSwitchingRole(false);
    }
  };

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

  // Safe redirect if genuinely unauthenticated
  useEffect(() => {
    if (!activeSession && status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [activeSession, status]);

  return (
    <div className="h-screen w-full bg-[#0b0f19] text-gray-100 flex flex-col md:flex-row overflow-hidden">
      {/* Global Command Palette Modal */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* Top Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800/80 bg-[#0f1422]/95 backdrop-blur-md shrink-0 z-30">
        <div className="flex items-center space-x-2.5">
          <LoopLogo size="sm" />
          <span className="text-base font-bold tracking-tight text-white">LOOP</span>
          <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {userRole}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCommandOpen(true)}
            className="p-2 rounded-xl bg-gray-800/70 border border-gray-700/60 text-gray-300 hover:text-white transition"
            title="Open Command Palette"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:text-white transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-40 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar (Slide-Over on Mobile, Static on Desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 flex flex-col h-full border-r border-gray-800/70 bg-[#0f1422] md:bg-[#0f1422]/95 backdrop-blur shrink-0 overflow-hidden select-none shadow-2xl md:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-gray-800/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LoopLogo size="md" />
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
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
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

          {/* Multi-Channel Ingestion Sync */}
          <div className="pt-4 mt-4 border-t border-gray-800/70 px-1">
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase mb-2 flex items-center justify-between">
              <span>Channel Sync</span>
              <Zap className="h-3 w-3 text-indigo-400" />
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                disabled={simulating || userRole === "VIEWER"}
                onClick={() => handleSimulateSync("Support ticket")}
                className="text-[11px] p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-40 text-left truncate transition font-medium cursor-pointer"
                title="Sync Support Tickets"
              >
                Support Tickets
              </button>
              <button
                disabled={simulating || userRole === "VIEWER"}
                onClick={() => handleSimulateSync("App store review")}
                className="text-[11px] p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-40 text-left truncate transition font-medium cursor-pointer"
                title="Sync App Store Reviews"
              >
                App Store
              </button>
              <button
                disabled={simulating || userRole === "VIEWER"}
                onClick={() => handleSimulateSync("NPS survey")}
                className="text-[11px] p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-40 text-left truncate transition font-medium cursor-pointer"
                title="Sync NPS Surveys"
              >
                NPS Surveys
              </button>
              <button
                disabled={simulating || userRole === "VIEWER"}
                onClick={() => handleSimulateSync("Sales call note")}
                className="text-[11px] p-1.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white disabled:opacity-40 text-left truncate transition font-medium cursor-pointer"
                title="Sync Sales Notes"
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
                <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || ""}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 text-gray-400 hover:text-rose-400 rounded-md hover:bg-gray-800/60 transition cursor-pointer"
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
        {/* Authentic Enterprise Header */}
        <header className="no-print bg-[#0f1422]/90 backdrop-blur-md border-b border-gray-800/80 px-5 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0 z-20">
          <div className="flex items-center space-x-2.5 text-gray-300">
            <Building2 className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-gray-200">{workspaceName}</span>
            <span className="text-gray-600">/</span>
            
            {/* Interactive RBAC Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition border cursor-pointer ${
                  userRole === "ADMIN"
                    ? "bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25"
                    : userRole === "ANALYST"
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/40 hover:bg-blue-500/25"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25"
                }`}
                title="Click to Switch Demo RBAC Role"
              >
                <span>{switchingRole ? "Switching..." : `${userRole} Role`}</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-[#0f1424] border border-gray-700 shadow-2xl p-1.5 z-50 animate-fadeIn space-y-1">
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800">
                    Switch Active RBAC Role:
                  </div>

                  <button
                    onClick={() => handleSwitchRole("admin@loop.dev")}
                    disabled={userRole === "ADMIN" || switchingRole}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition ${
                      userRole === "ADMIN"
                        ? "bg-purple-950/60 text-purple-300 border border-purple-800/60"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Admin Role</span>
                      <span className="text-[10px] text-gray-400 font-normal">Full settings & RBAC control</span>
                    </div>
                    {userRole === "ADMIN" && <UserCheck className="h-3.5 w-3.5 text-purple-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchRole("analyst@loop.dev")}
                    disabled={userRole === "ANALYST" || switchingRole}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition ${
                      userRole === "ANALYST"
                        ? "bg-blue-950/60 text-blue-300 border border-blue-800/60"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Analyst Role</span>
                      <span className="text-[10px] text-gray-400 font-normal">Ingest, triage & VoC reports</span>
                    </div>
                    {userRole === "ANALYST" && <UserCheck className="h-3.5 w-3.5 text-blue-400" />}
                  </button>

                  <button
                    onClick={() => handleSwitchRole("viewer@loop.dev")}
                    disabled={userRole === "VIEWER" || switchingRole}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition ${
                      userRole === "VIEWER"
                        ? "bg-amber-950/60 text-amber-300 border border-amber-800/60"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Viewer Role</span>
                      <span className="text-[10px] text-gray-400 font-normal">Read-only exploration</span>
                    </div>
                    {userRole === "VIEWER" && <UserCheck className="h-3.5 w-3.5 text-amber-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400 text-[11px]">
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-gray-200 transition cursor-pointer"
            >
              <Search className="h-3 w-3 text-gray-500" />
              <span>Search</span>
              <kbd className="font-mono text-[9px] bg-gray-800 px-1 py-0.2 rounded border border-gray-700">⌘K</kbd>
            </button>

            <span className="hidden sm:inline font-mono text-[10px] text-gray-500">
              Tenant: <span className="text-indigo-300">{user?.workspaceId?.slice(0, 8) || "default"}</span>
            </span>

            <span className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Encrypted Session</span>
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

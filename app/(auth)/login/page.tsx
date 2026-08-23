"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Layers,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@loop.dev");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<string>("admin");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Invalid credentials");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, personaKey: string) => {
    setLoading(true);
    setError(null);
    setActivePersona(personaKey);
    setEmail(demoEmail);
    setPassword("Password123!");

    const res = await signIn("credentials", {
      email: demoEmail,
      password: "Password123!",
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 flex flex-col lg:flex-row overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* LEFT COLUMN: Product Intelligence Showcase (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 border-r border-gray-800/60 bg-[#0c101d]/60 backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-black text-xl text-white shadow-xl shadow-indigo-500/25 ring-1 ring-white/20">
              ∞
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">Project LOOP</span>
              <span className="ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Enterprise AI Intel
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Turn Chaotic Customer Feedback into{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-300 bg-clip-text text-transparent">
                Decisive Product Roadmap Intelligence.
              </span>
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
              Unified multi-channel ingestion, grounded semantic vector search, theme clustering, and automated Voice-of-Customer executive digests.
            </p>
          </div>

          {/* Core Enterprise Architecture Pillars */}
          <div className="space-y-3.5 pt-2 max-w-lg">
            {[
              {
                icon: Layers,
                title: "Unified Multi-Channel Ingestion Pipeline",
                desc: "Ingest and normalize feedback streams across Support Tickets, App Store reviews, NPS surveys, and Sales notes.",
              },
              {
                icon: Sparkles,
                title: "Grounded Semantic Vector Intelligence",
                desc: "RAG-driven plain English query engine strictly grounded in verified customer feedback with zero hallucination.",
              },
              {
                icon: TrendingUp,
                title: "Automated Theme Clustering & Spike Velocity",
                desc: "Continuous statistical tracking of emerging topic surges and negative sentiment friction points.",
              },
              {
                icon: ShieldCheck,
                title: "Strict Multi-Tenant Row-Level Security",
                desc: "Deterministic workspace isolation, role-based access control (RBAC), and SOC-2 Type II audit readiness.",
              },
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 flex items-start gap-3.5"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5 border border-indigo-500/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-200">{pillar.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="pt-6 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Dedicated Multi-Tenant Isolation & Encryption</span>
          </div>
          <span className="font-mono text-[11px] text-gray-400">SOC2 Type II Ready</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication Portal */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-black text-xl text-white shadow-xl shadow-indigo-500/25">
              ∞
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Project LOOP</span>
              <p className="text-xs text-gray-400">AI Customer Feedback Intelligence</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to Workspace</h2>
            <p className="text-xs text-gray-400 mt-1">
              Enter your corporate credentials or choose a 1-click evaluation persona.
            </p>
          </div>

          {/* Quick 1-Click Evaluation Persona Bar */}
          <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> 1-Click Evaluation Access
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Demo Password: Password123!</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@loop.dev", "admin")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  activePersona === "admin"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30"
                    : "bg-gray-800/80 hover:bg-gray-850 border-gray-700/80 text-gray-200"
                }`}
              >
                <span>Admin</span>
                <span className="text-[9px] text-indigo-200/80 font-normal">Full Control</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("analyst@loop.dev", "analyst")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  activePersona === "analyst"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30"
                    : "bg-gray-800/80 hover:bg-gray-850 border-gray-700/80 text-gray-200"
                }`}
              >
                <span>Analyst</span>
                <span className="text-[9px] text-indigo-200/80 font-normal">Triage & Reports</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("viewer@loop.dev", "viewer")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  activePersona === "viewer"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30"
                    : "bg-gray-800/80 hover:bg-gray-850 border-gray-700/80 text-gray-200"
                }`}
              >
                <span>Viewer</span>
                <span className="text-[9px] text-indigo-200/80 font-normal">Read-Only</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">Password</label>
                <span className="text-[11px] text-gray-500">Min. 8 characters</span>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Authenticating Workspace Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center text-xs text-gray-400 border-t border-gray-800/60">
            <span>Need a new organization instance? </span>
            <Link
              href="/signup"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              Create company workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

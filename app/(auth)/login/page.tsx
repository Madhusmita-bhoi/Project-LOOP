"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  Zap,
  Activity,
  Sparkles,
  Layers,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password. Please verify your credentials.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050711] text-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* High-Precision Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Layered Atmospheric Ambient Glows */}
      <div className="absolute top-[12%] left-[5%] w-[850px] h-[850px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Expanded Split Container Pushing Content Farther Left */}
      <div className="w-full max-w-[1520px] mx-auto flex flex-col lg:flex-row justify-between items-center relative z-10 py-6 px-4 sm:px-8 lg:px-12 gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: Anchored More to the Left with Exact Dimensions */}
        <div className="w-full lg:max-w-[620px] space-y-5 text-left">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>AI-Powered Feedback Intelligence Platform</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-black tracking-tight leading-[1.12] text-white">
              Turn Raw Customer Feedback into{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                Strategic Velocity
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-xl">
              Project LOOP unifies scattered support tickets, app store reviews, and NPS surveys into real-time sentiment alerts, clustered themes, and grounded VoC executive digests.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Card 1: Live CSAT */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b101e]/80 border border-gray-800/80 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Live CSAT Pulse
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                  +6.4%
                </span>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">94.2%</div>
              <p className="text-xs text-gray-400 mt-1">
                Real-time multi-channel sentiment velocity across active customer touchpoints.
              </p>
            </div>

            {/* Card 2: Grounded RAG AI Search */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b101e]/80 border border-gray-800/80 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-indigo-400" />
                  Vector RAG Speed
                </span>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/50">
                  42ms
                </span>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">100% Grounded</div>
              <p className="text-xs text-gray-400 mt-1">
                Zero hallucinations with transparent citation provenance linked to sources.
              </p>
            </div>
          </div>

          {/* Live Ingestion Stream */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0e1c]/90 border border-indigo-900/40 backdrop-blur-xl flex items-center justify-between gap-3 text-xs sm:text-sm shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-gray-300 truncate font-medium">
                Live Ingestion: Performance & speed themes updated across 162 items
              </span>
            </div>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800/50 shrink-0 font-mono">
              Syncing
            </span>
          </div>

          {/* Security & Role Badges */}
          <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-gray-400 pt-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Multi-Tenant Row Isolation</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-400" />
              <span>Role-Based Access Control</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Login Card */}
        <div className="w-full lg:max-w-[450px] animate-fadeIn">
          {/* Card Header & Logo */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl blur-lg opacity-60" />
              <div className="relative inline-flex items-center justify-center h-15 w-15 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white font-black text-2xl shadow-xl shadow-indigo-500/30 ring-1 ring-indigo-400/40 ring-offset-4 ring-offset-[#050711] p-3.5">
                ∞
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Project LOOP
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Sign in to your organization workspace
            </p>
          </div>

          {/* Glass Card */}
          <div className="bg-[#0b101e]/90 backdrop-blur-2xl border border-gray-800/90 hover:border-indigo-500/40 rounded-3xl p-8 sm:p-9 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),0_0_60px_-15px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
              {/* Decoy fields to suppress aggressive browser autofill */}
              <input type="text" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
              <input type="password" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative group">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type="email"
                    name="auth_email_input"
                    id="auth_email_input"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-300">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="auth_password_input"
                    id="auth_password_input"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-200 transition cursor-pointer p-0.5 rounded"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                <label className="flex items-center space-x-2 text-gray-400 cursor-pointer hover:text-gray-300 transition">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-gray-900 border-gray-800 text-indigo-600 focus:ring-indigo-500/30 h-4 w-4 cursor-pointer"
                  />
                  <span>Remember workspace</span>
                </label>

                <span className="text-xs font-semibold text-indigo-400">
                  Enterprise SSO
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer mt-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Registration Link */}
            <div className="pt-4 text-center text-xs sm:text-sm text-gray-400 border-t border-gray-800/80">
              <span>New organization? </span>
              <Link
                href="/signup"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Create company workspace
              </Link>
            </div>
          </div>

          {/* Security Subtext */}
          <div className="mt-5 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Encrypted Multi-Tenant Session</span>
          </div>
        </div>

      </div>
    </div>
  );
}

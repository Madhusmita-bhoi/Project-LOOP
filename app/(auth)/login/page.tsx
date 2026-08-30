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
import LoopLogo from "@/components/LoopLogo";

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
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    setEmail(demoEmail);
    setPassword("Password123!");

    try {
      const res = await signIn("credentials", {
        email: demoEmail,
        password: "Password123!",
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Authentication failed. Please try again.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#050711] text-gray-100 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* High-Precision Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Layered Atmospheric Ambient Glows */}
      <div className="absolute top-[12%] left-[5%] w-[650px] max-w-full h-[650px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[550px] max-w-full h-[550px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Split Container: Single Screen Non-Scrollable */}
      <div className="w-full max-w-[1360px] mx-auto flex flex-col lg:flex-row justify-between items-center relative z-10 px-4 sm:px-6 lg:px-8 gap-6 lg:gap-10">
        
        {/* LEFT COLUMN: Shown on Desktop */}
        <div className="hidden lg:block w-full lg:max-w-[560px] space-y-3.5 text-left shrink-0">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI-Powered Feedback Intelligence Platform</span>
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <h1 className="text-3xl lg:text-[38px] font-black tracking-tight leading-[1.12] text-white">
              Turn Raw Customer Feedback into{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                Strategic Velocity
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
              Project LOOP unifies scattered support tickets, app store reviews, and NPS surveys into real-time sentiment alerts, clustered themes, and grounded VoC executive digests.
            </p>
          </div>

          {/* Live Ingestion Stream */}
          <div className="py-2 px-3.5 rounded-xl bg-[#0a0e1c]/90 border border-indigo-900/40 backdrop-blur-xl flex items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-gray-300 truncate font-medium text-xs">
                Live Ingestion: Performance & speed themes updated across 162 items
              </span>
            </div>
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50 shrink-0 font-mono">
              Syncing
            </span>
          </div>

          {/* Security & Role Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-0.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Multi-Tenant Row Isolation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-violet-400" />
              <span>Role-Based Access Control</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Centered Non-Scrollable Login Card */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-[450px] mx-auto animate-fadeIn shrink-0">
          {/* Card Header */}
          <div className="text-center mb-3">
            <div className="mb-2">
              <LoopLogo size="md" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Project LOOP
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 font-medium">
              Sign in to your organization workspace
            </p>
          </div>

          {/* Glass Card */}
          <div className="bg-[#0b101e]/90 backdrop-blur-2xl border border-gray-800/90 hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-300 space-y-3">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} autoComplete="off" className="space-y-3">
              {/* Decoy fields to suppress aggressive browser autofill */}
              <input type="text" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
              <input type="password" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Work Email Address
                </label>
                <div className="relative group">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type="email"
                    name="auth_email_input"
                    id="auth_email_input"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3.5 py-2 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-200">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="auth_password_input"
                    id="auth_password_input"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition cursor-pointer p-0.5 rounded"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Auxiliary Controls */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center space-x-1.5 cursor-pointer text-gray-400 hover:text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded bg-[#070a14] border-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                  />
                  <span>Remember workspace</span>
                </label>
                <span className="text-indigo-400/90 font-medium">Enterprise SSO</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer group disabled:opacity-60"
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

            {/* 1-Click Quick Demo Access */}
            <div className="pt-3 border-t border-gray-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1 text-indigo-400">
                  <Zap className="h-3.5 w-3.5" />
                  1-Click Demo Logins:
                </span>
                <span className="text-[10px] text-gray-500">Seed Workspace</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("admin@loop.dev")}
                  className="py-2 px-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 text-xs font-semibold text-center transition hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center gap-0.5 shadow-sm"
                >
                  <span className="font-bold text-white">Admin</span>
                  <span className="text-[10px] text-indigo-300/80">Full Access</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("analyst@loop.dev")}
                  className="py-2 px-2.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/80 border border-violet-700/50 text-violet-200 text-xs font-semibold text-center transition hover:border-violet-400 cursor-pointer flex flex-col items-center justify-center gap-0.5 shadow-sm"
                >
                  <span className="font-bold text-white">Analyst</span>
                  <span className="text-[10px] text-violet-300/80">Triage & AI</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin("viewer@loop.dev")}
                  className="py-2 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-gray-700 text-gray-200 text-xs font-semibold text-center transition hover:border-gray-500 cursor-pointer flex flex-col items-center justify-center gap-0.5 shadow-sm"
                >
                  <span className="font-bold text-white">Viewer</span>
                  <span className="text-[10px] text-gray-400">Read-Only</span>
                </button>
              </div>
            </div>

            {/* Registration Link */}
            <div className="pt-2 text-center text-xs sm:text-sm text-gray-400">
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
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Encrypted Multi-Tenant Session</span>
          </div>
        </div>

      </div>
    </div>
  );
}

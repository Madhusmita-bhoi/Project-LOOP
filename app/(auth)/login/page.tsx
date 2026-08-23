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
  Layers,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

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

  const featurePills = [
    { label: "Pipeline Active", detail: "Real-time Multi-Channel Sync", icon: Activity, color: "text-emerald-400" },
    { label: "Vector Search", detail: "Sub-50ms Grounded RAG", icon: Zap, color: "text-indigo-400" },
    { label: "Tenant Isolation", detail: "Row-Level AES-256 Security", icon: ShieldCheck, color: "text-violet-400" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#050711] text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* High-Precision Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Layered Atmospheric Ambient Glows */}
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-600/25 via-violet-600/20 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-indigo-700/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Center Auth Container */}
      <div className="w-full max-w-[480px] relative z-10 animate-fadeIn">
        {/* Prominent Brand Header & Large Glowing Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5">
            {/* Outer Aura Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
            
            {/* Large Emblem Icon */}
            <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white font-black text-4xl shadow-2xl shadow-indigo-500/40 ring-2 ring-indigo-400/50 ring-offset-4 ring-offset-[#050711] transition-transform hover:scale-105 duration-300">
              ∞
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-indigo-200 bg-clip-text text-transparent">
              Project LOOP
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400/90">
              AI Customer Feedback Intelligence Platform
            </p>
          </div>
        </div>

        {/* Premium Frosted Glass Card */}
        <div className="bg-[#0b101e]/90 backdrop-blur-2xl border border-gray-800/90 hover:border-indigo-500/40 rounded-3xl p-8 sm:p-10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),0_0_60px_-15px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-6">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Sign In to Workspace</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Access your organization's feedback intelligence feed
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-300 hover:bg-gray-800/60 transition cursor-pointer"
              title="Authentication help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>

          {showHelp && (
            <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-200 text-xs leading-relaxed animate-fadeIn">
              <p className="font-semibold text-white mb-1">Corporate Access & Roles:</p>
              <p className="text-[11px] text-gray-300">
                Log in with your company email. Permissions (Admin, Analyst, or Viewer) are automatically assigned by your organization administrator.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4.5">
            {/* Decoy fields to suppress aggressive browser autofill */}
            <input type="text" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
            <input type="password" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-3 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
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
                  className="w-full pl-10 pr-10 py-3 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-200 transition cursor-pointer p-0.5 rounded"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 text-gray-400 cursor-pointer hover:text-gray-300 transition">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-800 text-indigo-600 focus:ring-indigo-500/30 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Remember this workspace</span>
              </label>

              <span className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">
                Enterprise SSO Ready
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Authenticating Workspace Session...</span>
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
          <div className="pt-4 text-center text-xs text-gray-400 border-t border-gray-800/80">
            <span>New organization instance? </span>
            <Link
              href="/signup"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              Create company workspace
            </Link>
          </div>
        </div>

        {/* Interactive System Intelligence Status Indicators */}
        <div className="mt-7 grid grid-cols-3 gap-2">
          {featurePills.map((pill, i) => {
            const Icon = pill.icon;
            return (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-[#0b101e]/70 border border-gray-800/70 text-center flex flex-col items-center justify-center space-y-1 transition hover:border-gray-700"
              >
                <div className="flex items-center gap-1">
                  <Icon className={`h-3 w-3 ${pill.color}`} />
                  <span className="text-[10px] font-bold text-gray-300">{pill.label}</span>
                </div>
                <span className="text-[9px] text-gray-500 truncate max-w-full font-mono">
                  {pill.detail}
                </span>
              </div>
            );
          })}
        </div>

        {/* Security & Compliance Subtext */}
        <div className="mt-5 flex items-center justify-center space-x-2 text-[11px] text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Strict Multi-Tenant Row Isolation • SOC-2 Type II Certified</span>
        </div>
      </div>
    </div>
  );
}

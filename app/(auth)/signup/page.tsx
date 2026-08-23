"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Activity,
  Sparkles,
  Layers,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "ANALYST" | "VIEWER">("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { id: "ADMIN", label: "Admin", desc: "Full Control" },
    { id: "ANALYST", label: "Analyst", desc: "Triage & Insights" },
    { id: "VIEWER", label: "Viewer", desc: "Read-Only" },
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.toLowerCase().trim(),
          password,
          workspaceName,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Automatically sign in with the new account
      const signInRes = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050711] text-gray-100 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* High-Precision Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Layered Atmospheric Ambient Glows */}
      <div className="absolute top-[12%] left-[10%] w-[800px] h-[800px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Scaled-Up 2-Column Split Container */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10 py-6 px-4 sm:px-6">
        
        {/* LEFT COLUMN: Scaled-Up Showcase */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Multi-Tenant Architecture</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-black tracking-tight leading-[1.12] text-white">
              Launch Your Dedicated{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                Intelligence Workspace
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-xl">
              Strict row-level multi-tenant isolation, automated sentiment clustering, and team-wide role-based access.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b101e]/80 border border-gray-800/80 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  Shared Data Stream
                </span>
                <span className="text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                  Synced
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">Admin & Analyst Sync</div>
              <p className="text-xs text-gray-400 mt-1">
                Teammates share the same feedback and reports in real time.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b101e]/80 border border-gray-800/80 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Row-Level Isolation
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  AES-256
                </span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">Enterprise Security</div>
              <p className="text-xs text-gray-400 mt-1">
                Zero crosstalk across different company instances.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-gray-400 pt-1">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Multi-Source Ingestion</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span>Grounded Vector Search</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scaled-Up Registration Card */}
        <div className="lg:col-span-5 w-full max-w-[460px] mx-auto animate-fadeIn">
          <div className="text-center mb-5">
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl blur-lg opacity-60" />
              <div className="relative inline-flex items-center justify-center h-15 w-15 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white font-black text-2xl shadow-xl shadow-indigo-500/30 ring-1 ring-indigo-400/40 ring-offset-4 ring-offset-[#050711] p-3.5">
                ∞
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Create Workspace
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Establish your dedicated feedback environment
            </p>
          </div>

          <div className="bg-[#0b101e]/90 backdrop-blur-2xl border border-gray-800/90 hover:border-indigo-500/40 rounded-3xl p-7 sm:p-8 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),0_0_60px_-15px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-3.5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} autoComplete="off" className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1">
                  Company / Workspace Name
                </label>
                <div className="relative group">
                  <Building className="h-4 w-4 absolute left-3.5 top-3 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Acme CloudScale Inc."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="h-4 w-4 absolute left-3.5 top-3 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1">
                  Work Email Address
                </label>
                <div className="relative group">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition cursor-pointer p-0.5 rounded"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1">
                  Initial Role
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#070a14] rounded-xl border border-gray-800">
                  {roles.map((r) => {
                    const isActive = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as any)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                        }`}
                      >
                        <div>{r.label}</div>
                        <div className="text-[9px] font-normal opacity-80">{r.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer mt-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Creating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2.5 text-center text-xs sm:text-sm text-gray-400 border-t border-gray-800/80">
              <span>Already have an account? </span>
              <Link
                href="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

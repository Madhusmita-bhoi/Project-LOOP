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
import LoopLogo from "@/components/LoopLogo";

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
        window.location.href = "/login";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete signup");
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Multi-Tenant Architecture</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl lg:text-[38px] font-black tracking-tight leading-[1.12] text-white">
              Launch Your Dedicated{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                Intelligence Workspace
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
              Strict row-level multi-tenant isolation, automated sentiment clustering, and team-wide role-based access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-0.5">
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

        {/* RIGHT COLUMN: Centered Non-Scrollable Registration Card */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-[460px] mx-auto animate-fadeIn shrink-0">
          <div className="text-center mb-2.5">
            <div className="mb-1.5">
              <LoopLogo size="md" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Create Workspace
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 font-medium">
              Establish your dedicated feedback environment
            </p>
          </div>

          <div className="bg-[#0b101e]/90 backdrop-blur-2xl border border-gray-800/90 hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-300 space-y-3">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} autoComplete="off" className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Company / Workspace Name
                </label>
                <div className="relative group">
                  <Building className="h-3.5 w-3.5 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Acme CloudScale Inc."
                    className="w-full pl-9 pr-3.5 py-1.5 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="h-3.5 w-3.5 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full pl-9 pr-3 py-1.5 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-1">
                    Work Email
                  </label>
                  <div className="relative group">
                    <Mail className="h-3.5 w-3.5 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full pl-9 pr-3 py-1.5 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="h-3.5 w-3.5 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-1.5 bg-[#070a14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-200 cursor-pointer p-0.5 rounded"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`p-1.5 rounded-xl border text-left transition cursor-pointer ${
                        role === r.id
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-[#070a14] border-gray-800 text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      <div className="font-bold text-[11px]">{r.label}</div>
                      <div className="text-[9px] text-gray-400">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer group disabled:opacity-60 mt-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Creating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Launch Organization Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-gray-800/80 text-center text-xs text-gray-400">
              <span>Already have an account? </span>
              <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Sign in to workspace
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

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
  Users,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const accountRoles = [
    {
      id: "ADMIN",
      label: "Admin",
      email: "admin@loop.dev",
      permission: "Full Workspace Control",
    },
    {
      id: "ANALYST",
      label: "Analyst",
      email: "analyst@loop.dev",
      permission: "Triage, Query & VoC Digests",
    },
    {
      id: "VIEWER",
      label: "Viewer",
      email: "viewer@loop.dev",
      permission: "Read-Only Dashboard Audit",
    },
  ];

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
        setError(res.error || "Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: typeof accountRoles[0]) => {
    setActiveRole(role.id);
    setEmail(role.email);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient Gradient Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Center Auth Card */}
      <div className="w-full max-w-[420px] relative z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-2xl shadow-xl shadow-indigo-500/25 ring-1 ring-white/20 mb-3.5">
            ∞
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Project LOOP
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Customer Feedback Intelligence Platform
          </p>
        </div>

        {/* Auth Glass Panel */}
        <div className="bg-[#0e1322]/90 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/80 space-y-4">
          {/* Account Role Buttons */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                Select Account Role:
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-900/90 rounded-xl border border-gray-800">
              {accountRoles.map((role) => {
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>

            {activeRole && (
              <div className="mt-2 text-center animate-fadeIn">
                <span className="text-[11px] font-medium text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-900/50 inline-block">
                  {accountRoles.find((r) => r.id === activeRole)?.permission}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  autoComplete="new-password"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    const matching = accountRoles.find(
                      (r) => r.email.toLowerCase() === e.target.value.toLowerCase().trim()
                    );
                    setActiveRole(matching ? matching.id : "");
                  }}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-750 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-900/90 border border-gray-750 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition cursor-pointer"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer pt-3 pb-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Links & Switcher */}
          <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-800/80">
            <span>Don't have an account? </span>
            <Link
              href="/signup"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              Register new workspace
            </Link>
          </div>
        </div>

        {/* Security Subtext */}
        <div className="mt-5 flex items-center justify-center space-x-2 text-[11px] text-gray-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Role-Based Access Control • Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}

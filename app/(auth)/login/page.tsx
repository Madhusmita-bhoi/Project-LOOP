"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Sparkles, ArrowRight, Lock, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
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
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center space-x-3 mb-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-500/25 ring-1 ring-white/20">
            ∞
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-indigo-300 bg-clip-text text-transparent">
            LOOP
          </span>
        </div>
        <h2 className="text-center text-xl font-bold text-gray-100">
          AI Customer Feedback Intelligence
        </h2>
        <p className="mt-1 text-center text-xs text-gray-400">
          Sign in to access your multi-tenant feedback workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800/80">
          {/* Quick 1-Click Demo Login Bar */}
          <div className="mb-6 pb-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> 1-Click Demo Login
              </span>
              <span className="text-[11px] text-gray-400">Password: Password123!</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@loop.dev")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold transition group"
              >
                <span>👑 Admin</span>
                <span className="text-[10px] text-purple-400 font-normal">Full Control</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("analyst@loop.dev")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-200 text-xs font-semibold transition group"
              >
                <span>🔬 Analyst</span>
                <span className="text-[10px] text-blue-400 font-normal">Manage & Triage</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("viewer@loop.dev")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-200 text-xs font-semibold transition group"
              >
                <span>👁️ Viewer</span>
                <span className="text-[10px] text-amber-400 font-normal">Read Only</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-gray-900/80 border border-gray-700/80 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-gray-900/80 border border-gray-700/80 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-400">
              Need a new workspace?{" "}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
                Create company workspace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

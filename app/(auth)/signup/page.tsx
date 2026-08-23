"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building, Lock, Mail, User, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          email,
          password,
          workspaceName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Automatically sign in with the new admin account
      const signInRes = await signIn("credentials", {
        email,
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
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

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
          Create Your Feedback Workspace
        </h2>
        <p className="mt-1 text-center text-xs text-gray-400">
          Sign up to establish a private, multi-tenant intelligence hub
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800/80">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Company / Workspace Name</label>
              <div className="relative">
                <Building className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Tech Inc."
                  className="w-full pl-9 pr-3 py-2 bg-gray-900/80 border border-gray-700/80 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Your Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-9 pr-3 py-2 bg-gray-900/80 border border-gray-700/80 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
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
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-gray-900/80 border border-gray-700/80 rounded-xl text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center space-x-2 transition"
            >
              <span>{loading ? "Creating Workspace..." : "Create Workspace & Admin Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

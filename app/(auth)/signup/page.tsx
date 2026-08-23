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
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[#070a12] text-gray-100 flex flex-col lg:flex-row overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* LEFT COLUMN: Enterprise Value Showcase (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 border-r border-gray-800/60 bg-[#0c101d]/60 backdrop-blur-xl relative z-10">
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
              Establish Your Dedicated{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-300 bg-clip-text text-transparent">
                Customer Intelligence Cloud.
              </span>
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
              Set up a private multi-tenant workspace with strict row-level security, automated vector embedding pipeline, and instant semantic feedback synthesis.
            </p>
          </div>

          {/* Included Features Grid */}
          <div className="space-y-3 pt-2 max-w-lg">
            {[
              {
                title: "Strict Multi-Tenant Row Scoping",
                desc: "Isolated database tenancy with deterministic workspace IDs and role-based permissions.",
              },
              {
                title: "Grounded AI RAG Synthesizer",
                desc: "Ask plain-English product questions backed 100% by direct customer citations.",
              },
              {
                title: "Automated VoC Digest Generator",
                desc: "Weekly executive summaries, friction points breakdown, and exportable PDF reports.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-start gap-3"
              >
                <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">{f.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="pt-6 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Dedicated Tenant Isolation Guarantee</span>
          </div>
          <span className="font-mono text-[11px]">SOC2 Type II Ready</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Signup Form */}
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
            <h2 className="text-2xl font-bold tracking-tight text-white">Create Company Workspace</h2>
            <p className="text-xs text-gray-400 mt-1">
              Start with a full-featured admin instance in under 30 seconds.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Company / Workspace Name
              </label>
              <div className="relative">
                <Building className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Acme CloudScale Inc."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Admin Full Name
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/90 border border-gray-700/80 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Admin Password
              </label>
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
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Provisioning Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace & Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center text-xs text-gray-400 border-t border-gray-800/60">
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
  );
}

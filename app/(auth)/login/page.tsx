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
  Building2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setError(res.error || "Invalid email or password. Please try again.");
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
    <div className="min-h-screen w-full bg-[#070a14] text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* High-Precision Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* Layered Atmospheric Ambient Glows */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Center Auth Container */}
      <div className="w-full max-w-[450px] relative z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-15 w-15 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-black text-2xl shadow-xl shadow-indigo-500/30 ring-1 ring-indigo-400/40 ring-offset-4 ring-offset-[#070a14] mb-4.5 transition-transform hover:scale-105 duration-300">
            ∞
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-indigo-200 bg-clip-text text-transparent">
            Project LOOP
          </h1>
          <p className="text-xs font-medium text-gray-400 mt-1.5 tracking-wide">
            Enterprise Customer Feedback Intelligence Platform
          </p>
        </div>

        {/* Premium Frosted Glass Card */}
        <div className="bg-[#0b101d]/90 backdrop-blur-2xl border border-gray-800/90 hover:border-indigo-500/40 rounded-3xl p-8 sm:p-9 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_50px_-10px_rgba(99,102,241,0.2)] transition-all duration-300 space-y-6">
          {/* Card Title */}
          <div className="border-b border-gray-800/80 pb-4">
            <h2 className="text-base font-bold text-gray-100">Sign in to your workspace</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Enter your corporate credentials to access intelligence feeds.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4.5">
            {/* Decoy inputs to prevent browser aggressive autofill */}
            <input type="text" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
            <input type="password" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative group">
                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-gray-400 group-focus-within:text-indigo-400 transition" />
                <input
                  type="email"
                  name="auth_email_input"
                  id="auth_email_input"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#070b14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
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
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-gray-400 group-focus-within:text-indigo-400 transition" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="auth_password_input"
                  id="auth_password_input"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#070b14] border border-gray-800/90 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 transition cursor-pointer p-0.5 rounded"
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Authenticating Session...</span>
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

        {/* Security & Compliance Subtext */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-[11px] text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Role-Based Access Control • Encrypted Multi-Tenant Session</span>
        </div>
      </div>
    </div>
  );
}

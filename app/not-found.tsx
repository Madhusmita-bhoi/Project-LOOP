"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search, ShieldAlert, Sparkles } from "lucide-react";
import LoopLogo from "@/components/LoopLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#050711] text-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6 animate-fadeIn">
        <div className="flex justify-center mb-2">
          <LoopLogo size="lg" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            404 NOT FOUND
          </span>
          <h1 className="text-4xl font-black text-white tracking-tight mt-3">
            Page Does Not Exist
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            The feedback intelligence route or workspace entity you requested could not be located in Project LOOP.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b101e]/80 border border-gray-800/80 backdrop-blur text-xs text-gray-300 space-y-2 text-left">
          <p className="font-semibold text-gray-200">Quick Navigation:</p>
          <ul className="space-y-1.5 text-gray-400">
            <li>• <Link href="/dashboard" className="text-indigo-400 hover:underline">Executive Dashboard</Link> — Live feedback KPIs</li>
            <li>• <Link href="/inbox" className="text-indigo-400 hover:underline">Feedback Inbox</Link> — Triage customer feedback</li>
            <li>• <Link href="/ask" className="text-indigo-400 hover:underline">Ask LOOP</Link> — AI Grounded Q&A</li>
            <li>• <Link href="/reports" className="text-indigo-400 hover:underline">VoC Reports</Link> — Voice-of-Customer digests</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition"
          >
            <Home className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

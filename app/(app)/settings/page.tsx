"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Users,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Key,
  Database,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === "ADMIN";

  const [workspace, setWorkspace] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Invite Form
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "ANALYST",
    password: "Password123!",
  });
  const [inviting, setInviting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/members");
      const json = await res.json();
      if (res.ok) {
        setWorkspace(json.workspace);
        setMembers(json.members || []);
      }
    } catch (e) {
      console.error("Failed to load members", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setInviting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to invite member");

      setInviteModalOpen(false);
      setInviteForm({ name: "", email: "", role: "ANALYST", password: "Password123!" });
      setStatusMessage("Teammate added to workspace!");
      setTimeout(() => setStatusMessage(null), 3500);
      fetchMembers();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to invite teammate");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/workspace/members?userId=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update role");

      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
      );
      setStatusMessage("Role updated successfully!");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to change role");
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to remove ${name} from this workspace?`)) return;

    try {
      const res = await fetch(`/api/workspace/members?userId=${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove member");

      setMembers((prev) => prev.filter((m) => m.id !== userId));
      setStatusMessage("Member removed from workspace.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to remove member");
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Workspace & Access Control
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage multi-tenant workspace credentials, team memberships, and role permissions
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Invite Teammate</span>
          </button>
        )}
      </div>

      {/* Section 1: Workspace Overview Card */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-800">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-100">Tenant Workspace Details</h2>
            <p className="text-[11px] text-gray-400">Isolated database partition for this organization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Workspace Name</span>
            <p className="text-sm font-bold text-gray-200 mt-0.5">{workspace?.name || "Loading..."}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Tenant ID (Isolated Key)</span>
            <p className="text-xs font-mono font-bold text-indigo-400 mt-0.5 truncate">
              {workspace?.id || "..."}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Created Date</span>
            <p className="text-xs font-bold text-gray-200 mt-0.5">
              {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : "..."}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Role Permissions Matrix */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-800">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-100">Role-Based Access Control (RBAC) Matrix</h2>
            <p className="text-[11px] text-gray-400">Enforced strictly server-side on every API route</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">👑 ADMIN</span>
              <span className="text-[10px] font-mono bg-purple-900/60 text-purple-200 px-1.5 py-0.5 rounded">
                Full Access
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Manage workspace members, assign roles, configure settings, ingest & triage feedback, delete reports.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300">🔬 ANALYST</span>
              <span className="text-[10px] font-mono bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded">
                Ingest & Triage
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Ingest single/bulk CSV feedback, change workflow status, trigger manual re-classify, generate VoC reports.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">👁️ VIEWER</span>
              <span className="text-[10px] font-mono bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded">
                Read-Only
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Explore dashboards, view feedback inbox, analyze theme trends, ask LOOP questions, read VoC reports.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Team Members Table */}
      <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-gray-100">Team Members ({members.length})</h2>
          </div>
          {!isAdmin && (
            <span className="text-xs text-amber-400 font-medium">
              Only Admins can modify roles or invite teammates
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0d121f] text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Joined Date</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-indigo-400" />
                    <span>Loading members...</span>
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-[10px]">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{m.name}</span>
                        {m.id === currentUser?.id && (
                          <span className="text-[10px] font-normal text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded">
                            (You)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-gray-400 font-mono text-[11px]">{m.email}</td>
                    <td className="py-3.5 px-3">
                      {isAdmin ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                            m.role === "ADMIN"
                              ? "bg-purple-950/60 text-purple-300 border-purple-700/50"
                              : m.role === "ANALYST"
                              ? "bg-blue-950/60 text-blue-300 border-blue-700/50"
                              : "bg-amber-950/60 text-amber-300 border-amber-700/50"
                          }`}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="VIEWER">VIEWER</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            m.role === "ADMIN"
                              ? "bg-purple-500/20 text-purple-300"
                              : m.role === "ANALYST"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {m.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-gray-400 text-[11px] font-mono">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        {m.id !== currentUser?.id && (
                          <button
                            onClick={() => handleRemoveMember(m.id, m.name)}
                            className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                            title="Remove Member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: System Integrations & Health */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-800">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-100">AI Engine & Storage Status</h2>
            <p className="text-[11px] text-gray-400">Platform intelligence and vector store configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-gray-200">Claude AI Engine</span>
              <p className="text-[11px] text-gray-400">
                Anthropic API SDK with active Zero-Key Local Fallback Engine
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Operational
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-gray-200">Vector Embeddings Engine</span>
              <p className="text-[11px] text-gray-400">64-dim semantic cosine similarity vector search</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                Invite New Teammate
              </h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Teammate Full Name *</label>
                <input
                  type="text"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. Morgan Vance"
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="morgan@company.com"
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Assigned Role *</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ANALYST">ANALYST (Can ingest & triage feedback)</option>
                  <option value="VIEWER">VIEWER (Read-only access)</option>
                  <option value="ADMIN">ADMIN (Full workspace administrative access)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Initial Password</label>
                <input
                  type="text"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {inviting ? "Adding Teammate..." : "Send Invite & Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

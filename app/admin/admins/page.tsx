"use client";
import { useState } from "react";
import { Plus, MoreHorizontal, Shield, ShieldCheck, Eye, UserX, Key,
         X, Check, Copy, Mail, Clock, Lock, Unlock, UserCog } from "lucide-react";
import { ADMINS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Avatar, UserCell } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";

// ─── Permission catalogue ─────────────────────────────────────
const ALL_PERMISSIONS = [
  { id: "users",           label: "User Management",      desc: "View, edit, suspend learner accounts" },
  { id: "devices",         label: "Device Monitoring",    desc: "View device list, suspend devices" },
  { id: "courses",         label: "Courses & Content",    desc: "Create, edit, publish courses" },
  { id: "uploads",         label: "Content Uploads",      desc: "Upload videos, PDFs, materials" },
  { id: "certificates",    label: "Certificates",         desc: "Issue, revoke certificates" },
  { id: "payments",        label: "Payments",             desc: "View transactions, process refunds" },
  { id: "subscriptions",   label: "Subscriptions",        desc: "Manage plans and billing" },
  { id: "activation-codes","label": "Activation Codes",   desc: "Generate and revoke codes" },
  { id: "account-recovery","label": "Account Recovery",   desc: "Approve recovery requests" },
  { id: "reset-management","label": "Reset Management",   desc: "Initiate force resets" },
  { id: "audit-logs",      label: "Audit Logs",           desc: "View system audit trail" },
  { id: "admins",          label: "Admin Accounts",       desc: "Manage other admin users" },
];

const ROLE_DEFAULTS: Record<string, string[]> = {
  "Super Admin": ["all"],
  "Admin":       ["users","devices","courses","uploads","certificates","payments","subscriptions","activation-codes"],
  "Moderator":   ["courses","uploads","certificates"],
  "Viewer":      ["audit-logs"],
};

const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "var(--ndpc-blue)",
  "Admin":       "var(--ndpc-green)",
  "Moderator":   "var(--ndpc-amber)",
  "Viewer":      "var(--ink-3)",
};

// ─── Create / Edit admin form ─────────────────────────────────
function AdminForm({ initial, onSave, onCancel }: {
  initial?: typeof ADMINS[0];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [role, setRole] = useState<string>(initial?.role ?? "Moderator");
  const [perms, setPerms] = useState<string[]>(initial?.permissions ?? ROLE_DEFAULTS["Moderator"]);
  const [genPass, setGenPass] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSuperAdmin = role === "Super Admin";
  const effectivePerms = isSuperAdmin ? ["all"] : perms;

  const applyRoleDefaults = (r: string) => {
    setRole(r);
    setPerms(ROLE_DEFAULTS[r] ?? []);
  };

  const togglePerm = (id: string) => {
    setPerms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const mockPass = "Ndpc@" + Math.random().toString(36).slice(2, 8).toUpperCase();

  const copy = () => { navigator.clipboard?.writeText(mockPass).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-5">
      {/* Basic info */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Account details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Full name *</label>
            <input className="input" defaultValue={initial?.name ?? ""} placeholder="e.g. Kemi Iroha" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>NDPC email *</label>
            <input className="input" type="email" defaultValue={initial?.email ?? ""} placeholder="name@ndpc.ng" />
          </div>
        </div>
      </div>

      {/* Role */}
      <div>
        <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 8 }}>Role *</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {(["Super Admin", "Admin", "Moderator", "Viewer"] as const).map(r => (
            <button key={r} onClick={() => applyRoleDefaults(r)}
              style={{
                padding: "10px 8px", borderRadius: 8, textAlign: "center", fontSize: 12.5,
                fontWeight: role === r ? 600 : 400,
                border: `1.5px solid ${role === r ? ROLE_COLORS[r] : "var(--hairline)"}`,
                background: role === r ? `color-mix(in srgb, ${ROLE_COLORS[r]} 8%, var(--bg-elev))` : "var(--bg-sunk)",
                color: role === r ? ROLE_COLORS[r] : "var(--ink-3)",
              }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-3)" }}>
          {role === "Super Admin" && "Full platform access. Cannot be restricted."}
          {role === "Admin" && "Broad access to manage users, content, and payments."}
          {role === "Moderator" && "Content-focused — courses, uploads, certificates."}
          {role === "Viewer" && "Read-only access to audit logs."}
        </div>
      </div>

      {/* Permissions matrix */}
      {!isSuperAdmin && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontWeight: 600, fontSize: 13 }}>Permissions</div>
            <div className="flex gap-2">
              <button onClick={() => setPerms(ALL_PERMISSIONS.map(p => p.id))} style={{ fontSize: 11.5, color: "var(--ndpc-blue)" }}>Select all</button>
              <button onClick={() => setPerms([])} style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Clear</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ALL_PERMISSIONS.map(p => {
              const checked = effectivePerms.includes(p.id) || effectivePerms.includes("all");
              return (
                <label key={p.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 11px",
                  borderRadius: 7, border: `1px solid ${checked ? "color-mix(in srgb, var(--ndpc-blue) 25%, var(--hairline))" : "var(--hairline)"}`,
                  background: checked ? "color-mix(in srgb, var(--ndpc-blue) 4%, var(--bg-sunk))" : "var(--bg-sunk)",
                  cursor: "pointer",
                }}>
                  <input type="checkbox" checked={checked} onChange={() => togglePerm(p.id)} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 1 }}>{p.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Password */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Initial password</div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
            <input type="radio" name="passmode" checked={!genPass} onChange={() => setGenPass(false)} />
            <span style={{ fontSize: 13 }}>Send invite email (recommended)</span>
          </label>
          <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
            <input type="radio" name="passmode" checked={genPass} onChange={() => setGenPass(true)} />
            <span style={{ fontSize: 13 }}>Generate temp password</span>
          </label>
        </div>
        {genPass && (
          <div className="flex items-center gap-2" style={{ marginTop: 10, padding: "8px 12px", background: "var(--bg-sunk)", borderRadius: 8, border: "1px solid var(--hairline)" }}>
            <span style={{ flex: 1, fontFamily: "var(--font-geist-mono)", fontSize: 13 }}>{mockPass}</span>
            <button onClick={copy} className="flex items-center gap-1" style={{ fontSize: 11.5, color: "var(--ndpc-blue)" }}>
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {/* 2FA */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Two-factor authentication</div>
        <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
          <input type="checkbox" defaultChecked />
          <span style={{ fontSize: 13 }}>Require 2FA setup on first login</span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={onSave}><Check size={14} /> {initial ? "Save changes" : "Create admin"}</button>
      </div>
    </div>
  );
}

// ─── Activity log modal ───────────────────────────────────────
function AdminActivityModal({ admin, onClose }: { admin: typeof ADMINS[0]; onClose: () => void }) {
  return (
    <Modal open size="lg" onClose={onClose} title={`Activity log · ${admin.name}`}
      footer={<button className="btn" onClick={onClose}>Close</button>}>
      <div style={{ overflowX: "auto", border: "1px solid var(--hairline)", borderRadius: 8 }}>
        <table className="tbl">
          <thead><tr><th>Time</th><th>Action</th><th>Target</th><th>IP</th></tr></thead>
          <tbody>
            {[
              ["2026-05-12 09:42", "Suspended user",          "USR-10334 Ngozi Obi",      "102.89.34.12"],
              ["2026-05-12 08:11", "Published course",         "CRS-202 NDPR Practice",    "102.89.34.12"],
              ["2026-05-11 22:14", "Generated activation codes","AC-006 batch · 50 codes", "102.89.34.12"],
              ["2026-05-11 20:33", "Reset device activation",  "USR-10342 Adaeze Okafor",  "102.89.34.12"],
              ["2026-05-11 09:00", "Login",                    "Admin panel",              "102.89.34.12"],
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{r[0]}</td>
                <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12 }}>{r[1]}</td>
                <td style={{ fontSize: 12.5 }}>{r[2]}</td>
                <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5 }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function AdminsPage() {
  const [search, setSearch]       = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]     = useState<typeof ADMINS[0] | null>(null);
  const [viewLog, setViewLog]     = useState<typeof ADMINS[0] | null>(null);
  const [menuFor, setMenuFor]     = useState<string | null>(null);
  const [admins, setAdmins]       = useState(ADMINS);

  const filtered = admins.filter(a =>
    !search || `${a.name} ${a.email} ${a.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSuspend = (id: string) => {
    setAdmins(a => a.map(x => x.id === id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x));
    setMenuFor(null);
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>SYSTEM · ADMIN ACCOUNTS</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Admin Accounts</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Manage who has access to this control panel and what they can do.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={14} /> New admin</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Total admins"   icon={UserCog}    value={String(admins.length)} delta="" sparkData={[1,2,3,4,5,6]} />
        <StatCard eyebrow="Super Admins"   icon={ShieldCheck} value={String(admins.filter(a => a.role === "Super Admin").length)} delta="" sparkData={[1,1,1,1,1,1]} sparkColor="var(--ndpc-blue)" />
        <StatCard eyebrow="2FA enabled"    icon={Shield}     value={String(admins.filter(a => a.twofa).length)} delta={`${admins.filter(a => !a.twofa).length} without`} deltaDir="down" sparkData={[1,2,2,3,3,4]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Suspended"      icon={Lock}       value={String(admins.filter(a => a.status === "suspended").length)} delta="" sparkData={[0,0,1,0,1,1]} sparkColor="var(--ndpc-red)" />
      </div>

      {/* Table */}
      <div className="card">
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by name, email, role…">
          <select className="field" style={{ minWidth: 130 }}>
            <option>All roles</option>
            <option>Super Admin</option><option>Admin</option><option>Moderator</option><option>Viewer</option>
          </select>
        </FilterBar>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Admin</th><th>Role</th><th>Status</th><th>2FA</th>
                <th>Joined</th><th>Last active</th><th>Permissions</th><th style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const isSuperAdmin = a.role === "Super Admin";
                const permCount = a.permissions.includes("all") ? "All" : a.permissions.length;
                return (
                  <tr key={a.id}>
                    <td>
                      <UserCell name={a.name} sub={a.email} size="sm" />
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                        background: `color-mix(in srgb, ${ROLE_COLORS[a.role]} 10%, var(--bg-sunk))`,
                        color: ROLE_COLORS[a.role],
                        border: `1px solid color-mix(in srgb, ${ROLE_COLORS[a.role]} 25%, transparent)`,
                      }}>
                        {isSuperAdmin ? <ShieldCheck size={11} /> : <Shield size={11} />}
                        {a.role}
                      </span>
                    </td>
                    <td><StatusBadge value={a.status} /></td>
                    <td>
                      <span style={{ fontSize: 12, color: a.twofa ? "var(--ndpc-green)" : "var(--ink-4)" }}>
                        {a.twofa ? <Check size={13} /> : "—"}
                      </span>
                    </td>
                    <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{a.joined}</span></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.last === "Just now" || a.last.includes("min") ? "var(--ndpc-green)" : "var(--ink-4)" }} />
                        <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{a.last}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "var(--ink-3)" }}>
                        {permCount} modules
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1 items-center" style={{ position: "relative" }}>
                        <button className="btn btn-icon btn-ghost btn-sm" title="View activity" onClick={() => setViewLog(a)}><Eye size={13} /></button>
                        {!isSuperAdmin && (
                          <>
                            <button className="btn btn-icon btn-ghost btn-sm" title="More options" onClick={() => setMenuFor(menuFor === a.id ? null : a.id)}>
                              <MoreHorizontal size={14} />
                            </button>
                            {menuFor === a.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                                <div style={{
                                  position: "absolute", top: "100%", right: 0, zIndex: 20, minWidth: 180,
                                  background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 8,
                                  boxShadow: "var(--shadow-pop)", padding: 4,
                                }}>
                                  {[
                                    { icon: <UserCog size={13} />, label: "Edit permissions", action: () => { setEditing(a); setMenuFor(null); } },
                                    { icon: <Key size={13} />, label: "Reset password", action: () => setMenuFor(null) },
                                    { icon: <Mail size={13} />, label: "Resend invite", action: () => setMenuFor(null) },
                                    { icon: a.status === "active" ? <UserX size={13} /> : <Unlock size={13} />, label: a.status === "active" ? "Suspend" : "Reactivate", action: () => toggleSuspend(a.id), danger: a.status === "active" },
                                  ].map(item => (
                                    <button key={item.label} onClick={item.action}
                                      className="flex items-center gap-2 w-full"
                                      style={{ padding: "7px 10px", borderRadius: 6, fontSize: 12.5, color: item.danger ? "var(--ndpc-red)" : "var(--ink-2)", textAlign: "left" }}
                                      onMouseEnter={e => (e.currentTarget.style.background = "var(--hover)")}
                                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                    >
                                      {item.icon} {item.label}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create admin modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create new admin account" size="lg">
        <AdminForm onSave={() => setShowCreate(false)} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Edit admin modal */}
      {editing && (
        <Modal open onClose={() => setEditing(null)} title={`Edit: ${editing.name}`} size="lg">
          <AdminForm initial={editing} onSave={() => setEditing(null)} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {/* Activity log modal */}
      {viewLog && <AdminActivityModal admin={viewLog} onClose={() => setViewLog(null)} />}
    </div>
  );
}

"use client";
import { useState } from "react";
import { RESET_REQUESTS, USERS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { UserCell } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";
import { RefreshCw, ShieldOff, Smartphone, AlertTriangle, Plus, Check } from "lucide-react";

type Tab = "all" | "pending" | "completed" | "expired";

export default function ResetManagementPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [showForce, setShowForce] = useState(false);
  const [showDeviceReset, setShowDeviceReset] = useState(false);

  const filtered = RESET_REQUESTS.filter(r => {
    if (tab !== "all" && r.status !== tab) return false;
    if (search && !`${r.user} ${r.type}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: RESET_REQUESTS.length,
    pending: RESET_REQUESTS.filter(r => r.status === "pending").length,
    completed: RESET_REQUESTS.filter(r => r.status === "completed").length,
    expired: RESET_REQUESTS.filter(r => r.status === "expired").length,
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>SECURITY · RESET</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Reset Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Force password resets, device activation resets and reset audit trail.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => setShowDeviceReset(true)}><Smartphone size={14} /> Reset device activation</button>
          <button className="btn btn-primary" onClick={() => setShowForce(true)}><AlertTriangle size={14} /> Force password reset</button>
        </div>
      </div>

      <BackendPendingNotice label="reset management" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Pending resets"    icon={RefreshCw}  value={counts.pending}   delta="2 urgent"  sparkData={[1,2,1,2,2,3,2]} sparkColor="var(--ndpc-amber)" />
        <StatCard eyebrow="Completed (7d)"    icon={Check}      value={counts.completed} delta="+3 today"  deltaDir="up" sparkData={[1,2,3,2,3,4,5]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Expired links"     icon={AlertTriangle} value={counts.expired} delta="need cleanup" sparkData={[0,0,1,1,1,1,1]} sparkColor="var(--ndpc-red)" />
        <StatCard eyebrow="Device resets"     icon={Smartphone} value="6"                delta="this month" sparkData={[0,1,1,2,2,3,3]} />
      </div>

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all",       label: "All",       count: counts.all },
          { value: "pending",   label: "Pending",   count: counts.pending },
          { value: "completed", label: "Completed", count: counts.completed },
          { value: "expired",   label: "Expired",   count: counts.expired },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by user, type…" />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr><th>ID</th><th>User</th><th>Type</th><th>Status</th><th>Initiated</th><th>Initiated by</th><th style={{ width: 80 }}></th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><span className="id-mono">{r.id}</span></td>
                  <td><UserCell name={r.user} size="sm" /></td>
                  <td><span className="badge badge-info">{r.type}</span></td>
                  <td><StatusBadge value={r.status} /></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{r.initiated}</span></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "var(--ink-3)" }}>{r.initiatedBy}</span></td>
                  <td>
                    {r.status === "pending" && (
                      <button className="btn btn-sm"><RefreshCw size={12} /> Resend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Force password reset modal */}
      <Modal open={showForce} onClose={() => setShowForce(false)} title="Force Password Reset"
        footer={<>
          <button className="btn" onClick={() => setShowForce(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setShowForce(false)}><AlertTriangle size={14} /> Force reset</button>
        </>}>
        <div className="flex flex-col gap-3.5">
          <div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>User</label>
            <select className="input">{USERS.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}</select>
          </div>
          <div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Reason (logged to audit trail)</label>
            <textarea className="input" rows={3} placeholder="e.g. Compromised credentials reported by user" />
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: "color-mix(in srgb, var(--ndpc-amber) 8%, var(--bg-elev))", border: "1px solid color-mix(in srgb, var(--ndpc-amber) 25%, var(--line))", fontSize: 12.5 }}>
            <strong>Warning:</strong> This will immediately invalidate the user&apos;s current session and force them to set a new password on next login.
          </div>
        </div>
      </Modal>

      {/* Device activation reset modal */}
      <Modal open={showDeviceReset} onClose={() => setShowDeviceReset(false)} title="Reset Device Activation"
        footer={<>
          <button className="btn" onClick={() => setShowDeviceReset(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setShowDeviceReset(false)}><Smartphone size={14} /> Reset activation</button>
        </>}>
        <div className="flex flex-col gap-3.5">
          <div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>User</label>
            <select className="input">{USERS.map(u => <option key={u.id} value={u.id}>{u.name} ({u.devices} devices)</option>)}</select>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: "var(--bg-sunk)", fontSize: 12.5, color: "var(--ink-2)" }}>
            Resetting device activation will deregister all the user&apos;s current devices and allow them to re-register from scratch. This is logged to the audit trail.
          </div>
        </div>
      </Modal>
    </div>
  );
}

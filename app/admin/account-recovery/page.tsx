"use client";
import { useState } from "react";
import { Check, X, Eye, ShieldAlert } from "lucide-react";
import { RECOVERY_REQUESTS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { UserCell } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { Clock, Lock, RefreshCw } from "lucide-react";

type Tab = "all" | "pending" | "approved" | "rejected";

export default function AccountRecoveryPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<typeof RECOVERY_REQUESTS[0] | null>(null);

  const filtered = RECOVERY_REQUESTS.filter(r => {
    if (tab !== "all" && r.status !== tab) return false;
    if (search && !`${r.user} ${r.email} ${r.type}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: RECOVERY_REQUESTS.length,
    pending: RECOVERY_REQUESTS.filter(r => r.status === "pending").length,
    approved: RECOVERY_REQUESTS.filter(r => r.status === "approved").length,
    rejected: RECOVERY_REQUESTS.filter(r => r.status === "rejected").length,
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>SECURITY · RECOVERY</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Account Recovery</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Password reset requests, locked accounts, failed login recovery and manual approval queue.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Pending requests"   icon={Clock}      value={counts.pending}  delta="2 urgent"      sparkData={[1,2,1,3,2,3,3]} sparkColor="var(--ndpc-amber)" />
        <StatCard eyebrow="Locked accounts"    icon={Lock}       value="8"               delta="+2 today"      deltaDir="down" sparkData={[2,3,3,4,5,6,8]} sparkColor="var(--ndpc-red)" />
        <StatCard eyebrow="Approved (7d)"      icon={Check}      value={counts.approved} delta="avg 2h SLA"    deltaDir="up" sparkData={[0,1,2,1,2,2,3]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Recovery audit"     icon={ShieldAlert}value="42"              delta="this month"    sparkData={[2,4,5,6,7,8,9]} />
      </div>

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all",      label: "All",      count: counts.all },
          { value: "pending",  label: "Pending",  count: counts.pending },
          { value: "approved", label: "Approved", count: counts.approved },
          { value: "rejected", label: "Rejected", count: counts.rejected },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by user, email, type…" />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr><th>ID</th><th>User</th><th>Type</th><th>Reason</th><th>Status</th><th>Requested</th><th style={{ width: 120 }}></th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setSel(r)}>
                  <td><span className="id-mono">{r.id}</span></td>
                  <td><UserCell name={r.user} sub={r.email} size="sm" /></td>
                  <td><span className="badge badge-info">{r.type}</span></td>
                  <td style={{ color: "var(--ink-3)", fontSize: 13 }}>{r.reason}</td>
                  <td><StatusBadge value={r.status} /></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{r.requested}</span></td>
                  <td>
                    {r.status === "pending" && (
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm" style={{ color: "var(--ndpc-green)", borderColor: "color-mix(in srgb, var(--ndpc-green) 30%, var(--line))" }}><Check size={12} /> Approve</button>
                        <button className="btn btn-sm btn-danger"><X size={12} /> Reject</button>
                      </div>
                    )}
                    {r.status !== "pending" && <button className="btn btn-icon btn-ghost btn-sm" onClick={e => e.stopPropagation()}><Eye size={13} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? `Recovery Request · ${sel.id}` : ""}
        footer={<>
          <button className="btn" onClick={() => setSel(null)}>Close</button>
          {sel?.status === "pending" && <>
            <button className="btn btn-danger"><X size={14} /> Reject</button>
            <button className="btn btn-primary"><Check size={14} /> Approve recovery</button>
          </>}
        </>}>
        {sel && (
          <div className="flex flex-col gap-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["User", sel.user], ["Email", sel.email], ["Type", sel.type], ["Status", sel.status], ["Reason", sel.reason], ["Requested at", sel.requested]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>{l}</div>
                  <div>{l === "Status" ? <StatusBadge value={v} /> : v}</div>
                </div>
              ))}
            </div>
            {sel.status === "pending" && (
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>Admin action note</div>
                <textarea className="input" rows={3} placeholder="Reason for approval or rejection (logged to audit trail)…" />
              </div>
            )}
            <div style={{ padding: 12, borderRadius: 8, background: "var(--bg-sunk)", fontSize: 12.5 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Recovery audit trail</div>
              <div style={{ color: "var(--ink-3)" }}>{sel.requested} · Request submitted by user</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

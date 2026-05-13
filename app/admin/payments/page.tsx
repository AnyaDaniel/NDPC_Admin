"use client";
import { useState } from "react";
import { Download, MoreHorizontal, RefreshCw, Check, Link } from "lucide-react";
import { PAYMENTS, NAIRA } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { UserCell } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";
import { CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react";

type Tab = "all" | "success" | "pending" | "failed";

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<typeof PAYMENTS[0] | null>(null);

  const filtered = PAYMENTS.filter(p => {
    if (tab !== "all" && p.status !== tab) return false;
    if (search && !`${p.user} ${p.id} ${p.ref}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<string, number> = { all: PAYMENTS.length };
  ["success","pending","failed"].forEach(k => { counts[k] = PAYMENTS.filter(p => p.status === k).length; });
  const totalSuccess = PAYMENTS.filter(p => p.status === "success").reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>COMMERCE · PAYMENTS</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Payment Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Reconcile, rectify and audit every charge across Paystack, Flutterwave and direct transfers.</p>
        </div>
        <button className="btn"><Download size={14} /> Export ledger</button>
      </div>

      <BackendPendingNotice label="payments" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Captured (30d)" icon={CreditCard}    value={NAIRA(totalSuccess)} delta="+18.2% MoM" deltaDir="up"  sparkData={[40,45,50,60,70,80,90]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Successful"     icon={CheckCircle}   value={counts.success}      delta="+12 vs. last 7d" deltaDir="up" sparkData={[5,6,7,8,9,10,12]} />
        <StatCard eyebrow="Pending"        icon={Clock}         value={counts.pending}      delta="2 over 24h"  deltaDir="down" sparkData={[2,3,2,3,3,2,2]} sparkColor="var(--ndpc-amber)" />
        <StatCard eyebrow="Failed"         icon={AlertTriangle} value={counts.failed}       delta="−14% vs. wk" deltaDir="down" sparkData={[5,4,3,4,3,2,2]} sparkColor="var(--ndpc-red)" />
      </div>

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all",     label: "All",        count: counts.all },
          { value: "success", label: "Successful", count: counts.success },
          { value: "pending", label: "Pending",    count: counts.pending },
          { value: "failed",  label: "Failed",     count: counts.failed },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by user, ID, gateway ref…">
          <select className="field"><option>All gateways</option><option>Paystack</option><option>Flutterwave</option><option>Bank Tx.</option></select>
          <select className="field"><option>Last 30 days</option><option>Last 7 days</option><option>Today</option></select>
        </FilterBar>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Payment</th><th>User</th><th className="num">Amount</th><th>Channel</th>
                <th>Reference</th><th>Status</th><th>Date</th><th>Subscription</th><th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setSel(p)}>
                  <td><span className="id-mono">{p.id}</span></td>
                  <td><UserCell name={p.user} size="sm" /></td>
                  <td className="num">{NAIRA(p.amount)}</td>
                  <td><span className="badge badge-muted">{p.channel}</span></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{p.ref}</span></td>
                  <td>
                    <StatusBadge value={p.status} />
                    {"reason" in p && p.reason && <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 6 }}>· {p.reason}</span>}
                  </td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{p.date}</span></td>
                  <td><span className="id-mono">{p.sub}</span></td>
                  <td onClick={e => e.stopPropagation()}><button className="btn btn-icon btn-ghost btn-sm"><MoreHorizontal size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} size="lg"
        title={sel ? `Payment ${sel.id}` : ""}
        footer={<>
          <button className="btn" onClick={() => setSel(null)}>Close</button>
          <button className="btn"><Link size={14} /> Link to subscription</button>
          {sel?.status === "failed"  && <button className="btn btn-primary"><RefreshCw size={14} /> Rectify</button>}
          {sel?.status === "pending" && <button className="btn btn-primary" onClick={() => setSel(null)}><Check size={14} /> Mark resolved</button>}
        </>}>
        {sel && (
          <div className="flex flex-col gap-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["User", sel.user], ["Amount", NAIRA(sel.amount)], ["Status", sel.status], ["Channel", sel.channel], ["Reference", sel.ref], ["Date", sel.date]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: ["Reference","Date"].includes(l) ? "var(--font-geist-mono)" : undefined, fontSize: 13.5 }}>
                    {l === "Status" ? <StatusBadge value={v} /> : v}
                  </div>
                </div>
              ))}
            </div>
            {"reason" in sel && sel.reason && (
              <div className="card" style={{ padding: 12, background: "color-mix(in srgb, var(--ndpc-red) 6%, var(--bg-elev))", borderColor: "color-mix(in srgb, var(--ndpc-red) 25%, var(--line))" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ndpc-red)", marginBottom: 4 }}>Failure reason</div>
                <div style={{ color: "var(--ink-3)" }}>{sel.reason}</div>
              </div>
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>Admin note</div>
              <textarea className="input" rows={2} placeholder="Add a note to the audit trail…" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

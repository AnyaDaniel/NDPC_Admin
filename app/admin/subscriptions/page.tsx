"use client";
import { useState } from "react";
import { Download, Plus, Calendar, X, Check, MoreHorizontal } from "lucide-react";
import { SUBSCRIPTIONS, NAIRA } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { UserCell } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { CreditCard, AlertTriangle, TrendingDown } from "lucide-react";

type Tab = "all" | "active" | "pending" | "expired" | "cancelled";

export default function SubscriptionsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<typeof SUBSCRIPTIONS[0] | null>(null);
  const [showActivate, setShowActivate] = useState(false);

  const filtered = SUBSCRIPTIONS.filter(s => {
    if (tab !== "all" && s.status !== tab) return false;
    if (search && !`${s.user} ${s.id} ${s.plan}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<string, number> = { all: SUBSCRIPTIONS.length };
  ["active","pending","expired","cancelled"].forEach(k => { counts[k] = SUBSCRIPTIONS.filter(s => s.status === k).length; });
  const mrr = SUBSCRIPTIONS.filter(s => s.status === "active").reduce((sum, x) => sum + (x.plan.includes("Monthly") ? x.amount : x.amount / 12), 0);

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>COMMERCE · SUBSCRIPTIONS</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Subscription Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Activate, extend, cancel and audit every plan in flight.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn"><Download size={14} /> Export</button>
          <button className="btn btn-primary" onClick={() => setShowActivate(true)}><Plus size={14} /> Activate manually</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Active subscriptions" icon={CreditCard}    value="8,941"              delta="+1.8% MoM"    deltaDir="up" sparkData={[60,62,65,68,72,75,80].map(v=>v*10)} />
        <StatCard eyebrow="Monthly recurring"    icon={CreditCard}    value={NAIRA(Math.round(mrr))} suffix="/mo (sample)" delta="+12.4% MoM" deltaDir="up" sparkData={[1,2,2,3,4,5,6]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Churn (30d)"          icon={TrendingDown}  value="1.4%"               delta="−0.3pp"       deltaDir="down" sparkData={[2,2,2,1.8,1.6,1.5,1.4]} sparkColor="var(--ndpc-red)" />
      </div>

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all",       label: "All",       count: counts.all },
          { value: "active",    label: "Active",    count: counts.active },
          { value: "pending",   label: "Pending",   count: counts.pending },
          { value: "expired",   label: "Expired",   count: counts.expired },
          { value: "cancelled", label: "Cancelled", count: counts.cancelled },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search subscriptions…" />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Subscription</th><th>User</th><th>Plan</th><th className="num">Amount</th>
                <th>Status</th><th>Start</th><th>End</th><th>Auto-renew</th><th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => setSel(s)}>
                  <td><span className="id-mono">{s.id}</span></td>
                  <td><UserCell name={s.user} size="sm" /></td>
                  <td>{s.plan}</td>
                  <td className="num">{NAIRA(s.amount)}</td>
                  <td><StatusBadge value={s.status} /></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{s.start}</span></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{s.end}</span></td>
                  <td>
                    {s.auto
                      ? <span className="badge badge-success"><span className="dot" />on</span>
                      : <span className="badge badge-muted"><span className="dot" />off</span>}
                  </td>
                  <td>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button className="btn btn-icon btn-ghost btn-sm" title="Extend"><Calendar size={13} /></button>
                      <button className="btn btn-icon btn-ghost btn-sm" title="Cancel"><X size={13} /></button>
                      <button className="btn btn-icon btn-ghost btn-sm"><MoreHorizontal size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={!!sel} onClose={() => setSel(null)} size="lg"
        title={sel ? `Subscription ${sel.id}` : ""}
        footer={<>
          <button className="btn" onClick={() => setSel(null)}>Close</button>
          <button className="btn"><Calendar size={14} /> Extend 30 days</button>
          <button className="btn btn-primary"><Check size={14} /> Mark resolved</button>
        </>}>
        {sel && (
          <div className="flex flex-col gap-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["User", sel.user], ["Status", sel.status], ["Plan", sel.plan], ["Amount", NAIRA(sel.amount)], ["Start", sel.start], ["End", sel.end]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>{l}</div><div>{l === "Status" ? <StatusBadge value={v} /> : v}</div></div>
              ))}
            </div>
            <div style={{ overflowX: "auto", border: "1px solid var(--hairline)", borderRadius: 8 }}>
              <table className="tbl">
                <thead><tr><th>Date</th><th>Event</th><th>Actor</th></tr></thead>
                <tbody>
                  {[["2026-04-12 09:11", "Auto-renew succeeded", "system"], ["2025-08-12 14:22", "Subscription activated", "system"], ["2025-08-12 14:21", "Payment captured", "Paystack"]].map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{r[0]}</td>
                      <td>{r[1]}</td>
                      <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12 }}>{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual activation modal */}
      <Modal open={showActivate} onClose={() => setShowActivate(false)}
        title="Manually activate subscription"
        footer={<>
          <button className="btn" onClick={() => setShowActivate(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setShowActivate(false)}><Check size={14} /> Activate</button>
        </>}>
        <div className="flex flex-col gap-3.5">
          <div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>User</label><input className="input" placeholder="Search by name, email or ID…" /></div>
          <div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Plan</label>
            <select className="input"><option>Annual Pro — ₦96,000/yr</option><option>Monthly Pro — ₦12,000/mo</option></select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Start</label><input className="input" type="date" defaultValue="2026-05-12" /></div>
            <div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>End</label><input className="input" type="date" defaultValue="2027-05-12" /></div>
          </div>
          <div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Reason (admin note)</label><textarea className="input" rows={3} placeholder="e.g. Bank transfer received outside payment gateway" /></div>
        </div>
      </Modal>
    </div>
  );
}

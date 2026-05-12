"use client";
import { useState } from "react";
import { Download, Plus, Copy, Pause, MoreHorizontal, Check } from "lucide-react";
import { CODES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { KeyRound, CheckCircle, Clock } from "lucide-react";

type Tab = "all" | "unused" | "active" | "used" | "expired" | "deactivated";

export default function ActivationCodesPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [showGen, setShowGen] = useState(false);
  const [count, setCount] = useState(10);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = CODES.filter(c => {
    if (tab !== "all" && c.status !== tab) return false;
    if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<string, number> = { all: CODES.length };
  ["unused","active","used","expired","deactivated"].forEach(k => { counts[k] = CODES.filter(c => c.status === k).length; });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>COMMERCE · ACTIVATION CODES</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Activation Code Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Bulk-generate redemption codes for enterprise sales, scholarships and giveaways.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn"><Download size={14} /> Export codes</button>
          <button className="btn btn-primary" onClick={() => setShowGen(true)}><Plus size={14} /> Generate codes</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Codes generated"   icon={KeyRound}    value="1,284" delta="+50 this week"       deltaDir="up" sparkData={[10,20,15,30,28,40,50]} />
        <StatCard eyebrow="Redeemed"          icon={CheckCircle} value="812"   delta="63% redemption rate" deltaDir="up" sparkData={[8,10,12,14,16,18,20]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Expiring next 30d" icon={Clock}       value="42"    delta="Review before issuance"             sparkData={[2,4,3,5,6,5,7]} sparkColor="var(--ndpc-amber)" />
      </div>

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all",         label: "All",         count: counts.all },
          { value: "unused",      label: "Unused",      count: counts.unused },
          { value: "active",      label: "Active",      count: counts.active },
          { value: "used",        label: "Used",        count: counts.used },
          { value: "expired",     label: "Expired",     count: counts.expired },
          { value: "deactivated", label: "Deactivated", count: counts.deactivated },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by code…" />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Code</th><th>Uses</th><th>Expires</th><th>Status</th>
                <th>Created</th><th>Created by</th><th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><span className="code-chip">{c.code}</span></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12.5 }}>{c.uses} / {c.max}</span></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{c.expires}</span></td>
                  <td><StatusBadge value={c.status} /></td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{c.created}</span></td>
                  <td>{c.by}</td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <button className="btn btn-icon btn-ghost btn-sm" title="Copy" onClick={() => handleCopy(c.code)}>
                        {copied === c.code ? <Check size={13} style={{ color: "var(--ndpc-green)" }} /> : <Copy size={13} />}
                      </button>
                      <button className="btn btn-icon btn-ghost btn-sm" title="Deactivate"><Pause size={13} /></button>
                      <button className="btn btn-icon btn-ghost btn-sm"><MoreHorizontal size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showGen} onClose={() => setShowGen(false)} size="lg"
        title="Generate activation codes"
        footer={<>
          <button className="btn" onClick={() => setShowGen(false)}>Cancel</button>
          <button className="btn"><Download size={14} /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowGen(false)}><Plus size={14} /> Generate {count} codes</button>
        </>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { label: "How many codes?", type: "number", value: count, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCount(+e.target.value || 1) },
            { label: "Max uses per code", type: "number", defaultValue: 1 },
          ].map(({ label, ...rest }) => (
            <div key={label}>
              <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>{label}</label>
              <input className="input" {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Plan unlocked</label>
            <select className="input"><option>Annual Pro (₦96,000)</option><option>Monthly Pro (₦12,000)</option></select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Expiry date</label>
            <input className="input" type="date" defaultValue="2026-12-31" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Prefix</label>
            <input className="input" defaultValue="NDPC" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Batch label (internal)</label>
            <input className="input" placeholder="e.g. May 2026 — NDIC Partnership" />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8 }}>Format preview</div>
          <span className="code-chip" style={{ display: "inline-block", padding: "8px 12px" }}>NDPC-XXXX-YYYY-ZZZZ</span>
        </div>
      </Modal>
    </div>
  );
}

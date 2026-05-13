"use client";
import { useState } from "react";
import { Download, Users, CreditCard, KeyRound, BookOpen, Shield, Smartphone, Award, FileText } from "lucide-react";
import { AUDIT_LOGS } from "@/lib/mock-data";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatCard } from "@/components/admin/ui/StatCard";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";

const SCOPE_ICON: Record<string, React.ReactNode> = {
  user:    <Users size={15} />,
  payment: <CreditCard size={15} />,
  code:    <KeyRound size={15} />,
  content: <BookOpen size={15} />,
  ai:      <Shield size={15} />,
  device:  <Smartphone size={15} />,
  cert:    <Award size={15} />,
  auth:    <Shield size={15} />,
};

type Tab = "all" | "user" | "device" | "payment" | "code" | "content" | "ai" | "cert" | "auth";

export default function AuditLogsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const filtered = AUDIT_LOGS.filter(a => {
    if (tab !== "all" && a.scope !== tab) return false;
    if (search && !`${a.actor} ${a.action} ${a.target}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>SYSTEM · AUDIT</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Audit Logs</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Every admin and system action, immutable. Filter by scope, actor, or time window.</p>
        </div>
        <button className="btn"><Download size={14} /> Export (CSV)</button>
      </div>

      <BackendPendingNotice label="full audit log export and filtering" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Events today"  icon={FileText}  value="1,284" delta="+11%"              deltaDir="up" sparkData={[40,55,68,72,80,92,128]} />
        <StatCard eyebrow="Admin actions" icon={Shield}    value="312"   delta="6 admins active"   deltaDir="up" sparkData={[10,12,14,18,22,28,31]} />
        <StatCard eyebrow="Auth events"   icon={Users}     value="4,892" delta="+4.1%"             deltaDir="up" sparkData={[40,42,44,46,48,50,52]} />
        <StatCard eyebrow="Critical"      icon={Shield}    value="3"     delta="needs review"      sparkData={[0,1,0,1,1,0,1]} sparkColor="var(--ndpc-red)" />
      </div>

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all",     label: "All" },
          { value: "user",    label: "Account" },
          { value: "device",  label: "Devices" },
          { value: "payment", label: "Payments" },
          { value: "code",    label: "Codes" },
          { value: "content", label: "Content" },
          { value: "ai",      label: "AI" },
          { value: "cert",    label: "Certs" },
          { value: "auth",    label: "Auth" },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search actor, action, target…">
          <select className="field"><option>All actors</option><option>admin@ndpc.ng</option><option>kemi@ndpc.ng</option><option>system</option></select>
          <select className="field"><option>Last 7 days</option><option>Today</option><option>Last 30 days</option></select>
        </FilterBar>

        <div style={{ padding: "8px 14px 18px" }}>
          {filtered.map((a, i) => (
            <div key={i} className="flex items-start gap-3"
              style={{ padding: "10px 6px", borderBottom: i < filtered.length - 1 ? "1px solid var(--hairline)" : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-sunk)", border: "1px solid var(--hairline)", display: "grid", placeItems: "center", flexShrink: 0, color: "var(--ink-2)" }}>
                {SCOPE_ICON[a.scope] ?? <FileText size={15} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontWeight: 500 }}>{a.action}</span>
                  <span style={{ color: "var(--ink-4)" }}>·</span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12.5, color: "var(--ink-2)" }}>{a.target}</span>
                </div>
                <div className="flex gap-3 mt-0.5" style={{ color: "var(--ink-3)", fontSize: 12, fontFamily: "var(--font-geist-mono)" }}>
                  <span>{a.actor}</span><span>·</span><span>{a.ip}</span>
                </div>
              </div>
              <span className="badge badge-muted" style={{ textTransform: "uppercase", fontSize: 10, flexShrink: 0 }}>{a.scope}</span>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)", whiteSpace: "nowrap", flexShrink: 0 }}>{a.at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

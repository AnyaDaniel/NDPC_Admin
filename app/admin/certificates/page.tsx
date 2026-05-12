"use client";
import { useState } from "react";
import { Download, Search, XCircle, CheckCircle } from "lucide-react";
import { CERTIFICATES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { UserCell } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { Award } from "lucide-react";

type Tab = "all" | "valid" | "revoked";

export default function CertificatesPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [verify, setVerify] = useState("");
  const [verifyResult, setVerifyResult] = useState<null | "found" | "notfound">(null);
  const [showVerify, setShowVerify] = useState(false);
  const [sel, setSel] = useState<typeof CERTIFICATES[0] | null>(null);

  const filtered = CERTIFICATES.filter(c => {
    if (tab !== "all" && c.status !== tab) return false;
    if (search && !`${c.user} ${c.id} ${c.course}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { all: CERTIFICATES.length, valid: CERTIFICATES.filter(c => c.status === "valid").length, revoked: CERTIFICATES.filter(c => c.status === "revoked").length };

  const handleVerify = () => {
    const found = CERTIFICATES.find(c => c.id.toLowerCase().includes(verify.toLowerCase()));
    setVerifyResult(found ? "found" : "notfound");
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · CERTIFICATES</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Certificate Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Issue, verify and revoke certificates across all courses.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => { setVerifyResult(null); setVerify(""); setShowVerify(true); }}><Search size={14} /> Verify certificate</button>
          <button className="btn"><Download size={14} /> Export</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Total issued"  icon={Award}        value="3,261" delta="+42 today"    deltaDir="up" sparkData={[80,90,110,140,160,180,220]} />
        <StatCard eyebrow="Valid"         icon={CheckCircle}  value={counts.valid}  delta="all time"  deltaDir="up" sparkData={[70,80,100,130,150,170,210]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Revoked"       icon={XCircle}      value={counts.revoked} delta="4 this year" sparkData={[0,0,0,0,0,0,1]} sparkColor="var(--ndpc-red)" />
      </div>

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all",     label: "All",     count: counts.all },
          { value: "valid",   label: "Valid",   count: counts.valid },
          { value: "revoked", label: "Revoked", count: counts.revoked },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by user, cert ID, course…" />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr><th>Certificate ID</th><th>User</th><th>Course</th><th className="num">Score</th><th>Issued</th><th>Status</th><th style={{ width: 100 }}></th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSel(c)}>
                  <td><span className="id-mono">{c.id}</span></td>
                  <td><UserCell name={c.user} size="sm" /></td>
                  <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>{c.course}</td>
                  <td className="num">{c.score}%</td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{c.issued}</span></td>
                  <td><StatusBadge value={c.status} /></td>
                  <td>
                    <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                      <button className="btn btn-sm"><Download size={12} /> PDF</button>
                      {c.status === "valid" && <button className="btn btn-sm btn-danger"><XCircle size={12} /> Revoke</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify modal */}
      <Modal open={showVerify} onClose={() => setShowVerify(false)} title="Verify Certificate"
        footer={<>
          <button className="btn" onClick={() => setShowVerify(false)}>Close</button>
          <button className="btn btn-primary" onClick={handleVerify}><Search size={14} /> Verify</button>
        </>}>
        <div>
          <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Certificate ID or QR code data</label>
          <input className="input" placeholder="CERT-NDPC-2026-XXXXX" value={verify} onChange={e => setVerify(e.target.value)} />
          {verifyResult === "found" && (
            <div className="flex items-center gap-2 mt-4" style={{ padding: 12, borderRadius: 8, background: "color-mix(in srgb, var(--ndpc-green) 8%, var(--bg-elev))", border: "1px solid color-mix(in srgb, var(--ndpc-green) 25%, var(--line))" }}>
              <CheckCircle size={16} style={{ color: "var(--ndpc-green)" }} />
              <span style={{ fontWeight: 500, color: "var(--ndpc-green)" }}>Valid certificate found</span>
            </div>
          )}
          {verifyResult === "notfound" && (
            <div className="flex items-center gap-2 mt-4" style={{ padding: 12, borderRadius: 8, background: "color-mix(in srgb, var(--ndpc-red) 8%, var(--bg-elev))", border: "1px solid color-mix(in srgb, var(--ndpc-red) 25%, var(--line))" }}>
              <XCircle size={16} style={{ color: "var(--ndpc-red)" }} />
              <span style={{ fontWeight: 500, color: "var(--ndpc-red)" }}>Certificate not found or invalid</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.id ?? ""} footer={<>
        <button className="btn" onClick={() => setSel(null)}>Close</button>
        <button className="btn"><Download size={14} /> Download PDF</button>
        {sel?.status === "valid" && <button className="btn btn-danger"><XCircle size={14} /> Revoke</button>}
      </>}>
        {sel && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["User", sel.user], ["Course", sel.course], ["Score", sel.score + "%"], ["Issued", sel.issued], ["Status", sel.status]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>{l}</div>
                <div>{l === "Status" ? <StatusBadge value={v} /> : v}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

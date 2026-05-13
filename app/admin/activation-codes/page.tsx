"use client";
import { useState } from "react";
import { Copy, Plus, Check, KeyRound, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Modal } from "@/components/admin/ui/Modal";
import { EmptyState } from "@/components/admin/ui/EmptyState";

type CodeRow = { code: string; maxUses: number; expiresAt: string };

export default function ActivationCodesPage() {
  const [showGen, setShowGen] = useState(false);
  const [count, setCount] = useState(10);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.createActivationCodes({ count, maxUses, expiresInDays });
      setCodes(result.codes);
      setShowGen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate codes");
    } finally {
      setLoading(false);
    }
  };

  const copy = (code: string) => {
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
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Generate live activation codes from the backend. Historical list endpoint is backend pending.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowGen(true)}><Plus size={14} /> Generate codes</button>
      </div>

      {error && <div className="card" style={{ padding: 14, color: "var(--ndpc-red)", marginBottom: 16 }}>{error}</div>}

      <div className="card">
        {codes.length === 0 ? (
          <EmptyState icon={KeyRound} title="No generated batch in this session" description="Use Generate codes to create a live backend batch. Activation-code listing remains backend pending." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Code</th><th>Uses</th><th>Expires</th><th>Status</th><th style={{ width: 80 }}></th></tr></thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.code}>
                    <td><span className="code-chip">{c.code}</span></td>
                    <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12.5 }}>0 / {c.maxUses}</span></td>
                    <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{new Date(c.expiresAt).toLocaleDateString()}</span></td>
                    <td><StatusBadge value="unused" /></td>
                    <td><button className="btn btn-icon btn-ghost btn-sm" title="Copy" onClick={() => copy(c.code)}>{copied === c.code ? <Check size={13} /> : <Copy size={13} />}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showGen} onClose={() => setShowGen(false)} size="lg" title="Generate activation codes" footer={<>
        <button className="btn" onClick={() => setShowGen(false)}>Cancel</button>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading ? <RefreshCw size={14} /> : <Plus size={14} />} Generate {count} codes</button>
      </>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>How many codes?</span><input className="input" type="number" value={count} min={1} max={1000} onChange={e => setCount(+e.target.value || 1)} /></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Max uses</span><input className="input" type="number" value={maxUses} min={1} max={50} onChange={e => setMaxUses(+e.target.value || 1)} /></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Expires in days</span><input className="input" type="number" value={expiresInDays} min={1} max={365} onChange={e => setExpiresInDays(+e.target.value || 30)} /></label>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, Plus, RefreshCw } from "lucide-react";
import { ActivationCode, adminApi } from "@/lib/admin-api";
import { API_BASE_URL } from "@/lib/api-client";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Modal } from "@/components/admin/ui/Modal";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

type CodeRow = ActivationCode | {
  id?: string;
  code: string;
  usedCount?: number;
  usesCount?: number;
  maxUses: number;
  expiresAt: string | null;
  status?: string;
  createdAt?: string;
};

export default function ActivationCodesPage() {
  const [showGen, setShowGen] = useState(false);
  const [count, setCount] = useState(10);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCodes = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const result = await adminApi.activationCodes({ pageSize: 100, search, status });
      setCodes(result.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load activation codes");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    try {
      const result = await adminApi.createActivationCodes(
        { count, maxUses, expiresInDays },
        { signal: controller.signal }
      );
      if (!result.codes?.length) throw new Error("Backend returned no activation codes.");
      await loadCodes();
      setShowGen(false);
    } catch (err) {
      const message = err instanceof DOMException && err.name === "AbortError"
        ? "Activation-code generation timed out. Confirm the live backend is reachable from this browser."
        : err instanceof TypeError && err.message === "Failed to fetch"
          ? `Failed to reach backend at ${API_BASE_URL}. Check the deployed admin API URL, CORS, and backend availability.`
          : err instanceof Error
            ? err.message
            : "Unable to generate codes";
      setError(message);
    } finally {
      window.clearTimeout(timeout);
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
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Activation Code Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Generate and manage live backend activation codes.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={loadCodes} disabled={loadingList}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowGen(true)}><Plus size={14} /> Generate codes</button>
        </div>
      </div>

      {error && <div className="card" style={{ padding: 14, color: "var(--ndpc-red)", marginBottom: 16 }}>{error}</div>}

      <div className="card">
        <div className="flex gap-2" style={{ padding: 18, borderBottom: "1px solid var(--hairline)" }}>
          <input className="input" placeholder="Search activation codes..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === "Enter") loadCodes(); }} />
          <select className="input" style={{ maxWidth: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="unused">Unused</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="maxed">Maxed</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn" onClick={loadCodes} disabled={loadingList}>Apply</button>
        </div>

        {loadingList ? (
          <EmptyState icon={RefreshCw} title="Loading activation codes" />
        ) : codes.length === 0 ? (
          <EmptyState icon={KeyRound} title="No activation codes found" description="Generate codes to create a live backend batch." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Code</th><th>Uses</th><th>Expires</th><th>Status</th><th>Created</th><th style={{ width: 80 }}></th></tr></thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id ?? c.code}>
                    <td><span className="code-chip">{c.code}</span></td>
                    <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12.5 }}>{c.usedCount ?? c.usesCount ?? 0} / {c.maxUses}</span></td>
                    <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "-"}</span></td>
                    <td><StatusBadge value={c.status ?? "unused"} /></td>
                    <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</span></td>
                    <td><button className="btn btn-icon btn-ghost btn-sm" title="Copy" onClick={() => copy(c.code)}>{copied === c.code ? <Check size={13} /> : <Copy size={13} />}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showGen} onClose={() => setShowGen(false)} size="lg" title="Generate activation codes" footer={<>
        <button className="btn" onClick={() => setShowGen(false)} disabled={loading}>Cancel</button>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading ? <RefreshCw size={14} /> : <Plus size={14} />} Generate {count} codes</button>
      </>}>
        {error && (
          <div style={{ padding: 12, border: "1px solid var(--ndpc-red)", borderRadius: 8, color: "var(--ndpc-red)", marginBottom: 14 }}>
            {error}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>How many codes?</span><input className="input" type="number" value={count} min={1} max={1000} onChange={e => setCount(+e.target.value || 1)} /></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Max uses</span><input className="input" type="number" value={maxUses} min={1} max={50} onChange={e => setMaxUses(+e.target.value || 1)} /></label>
          <label><span style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Expires in days</span><input className="input" type="number" value={expiresInDays} min={1} max={365} onChange={e => setExpiresInDays(+e.target.value || 30)} /></label>
        </div>
      </Modal>
    </div>
  );
}

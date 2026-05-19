"use client";
import { useMemo, useState } from "react";
import { Download, Search, XCircle, CheckCircle, Award, RefreshCw } from "lucide-react";
import { adminApi, Certificate } from "@/lib/admin-api";
import { API_BASE_URL, ApiError } from "@/lib/api-client";
import { useApiResource } from "@/lib/use-api-resource";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";
import { EmptyState } from "@/components/admin/ui/EmptyState";

function certId(c: Certificate) { return String(c.certificateNumber ?? c.id ?? "-"); }
function certUser(c: Certificate) { return String(c.learnerName ?? c.userName ?? c.user ?? "-"); }
function certCourse(c: Certificate) { return String(c.courseTitle ?? c.courseName ?? c.course ?? "-"); }
function certPdfHref(c: Certificate) {
  const url = String(c.pdfUrl ?? "");
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const api = new URL(API_BASE_URL);
  return `${api.origin}${url}`;
}

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [verify, setVerify] = useState("");
  const [verifyResult, setVerifyResult] = useState<Certificate | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showVerify, setShowVerify] = useState(false);
  const { data, loading, error, reload } = useApiResource(() => adminApi.certificates(), []);
  const certificates = data?.certificates ?? [];
  const filtered = useMemo(() => certificates.filter(c => !search || `${certUser(c)} ${certId(c)} ${certCourse(c)}`.toLowerCase().includes(search.toLowerCase())), [certificates, search]);

  const handleVerify = async () => {
    setVerifyResult(null); setVerifyError(null);
    try { setVerifyResult(await adminApi.verifyCertificate(verify.trim())); }
    catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setVerifyError("Certificate not found or invalid");
        return;
      }
      setVerifyError("Unable to verify certificate right now");
    }
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5"><div><div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>LEARNING · CERTIFICATES</div><h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Certificate Management</h1><p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Live certificate list and backend verification.</p></div><div className="flex gap-2"><button className="btn" onClick={() => { setVerifyResult(null); setVerifyError(null); setVerify(""); setShowVerify(true); }}><Search size={14} /> Verify certificate</button><button className="btn" onClick={reload}><RefreshCw size={14} /> Refresh</button></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}><StatCard eyebrow="Total issued" icon={Award} value={certificates.length} delta="backend" sparkData={[1,2,3,4]} /><StatCard eyebrow="Valid" icon={CheckCircle} value={certificates.filter(c => c.status !== "revoked").length} sparkData={[1,2,3]} /><StatCard eyebrow="Revoked" icon={XCircle} value={certificates.filter(c => c.status === "revoked").length} sparkData={[0,1]} /></div>
      <div className="card"><FilterBar search={search} onSearch={setSearch} placeholder="Search by user, cert ID, course..." />{loading && <EmptyState icon={RefreshCw} title="Loading certificates" />}{error && <EmptyState title="Unable to load certificates" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}{!loading && !error && filtered.length === 0 && <EmptyState title="No certificates found" />}{!loading && !error && filtered.length > 0 && <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Certificate ID</th><th>User</th><th>Course</th><th>Issued</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(c => <tr key={certId(c)}><td><span className="id-mono">{certId(c)}</span></td><td>{certUser(c)}</td><td>{certCourse(c)}</td><td>{c.issuedAt ? new Date(String(c.issuedAt)).toLocaleDateString() : "-"}</td><td><StatusBadge value={String(c.status ?? "valid")} /></td><td>{certPdfHref(c) ? <a className="btn btn-sm" href={certPdfHref(c)} target="_blank" rel="noreferrer"><Download size={12} /> PDF</a> : <span style={{ color: "var(--ink-4)", fontSize: 12 }}>No PDF URL</span>}</td></tr>)}</tbody></table></div>}</div>
      <Modal open={showVerify} onClose={() => setShowVerify(false)} title="Verify Certificate" footer={<><button className="btn" onClick={() => setShowVerify(false)}>Close</button><button className="btn btn-primary" onClick={handleVerify}><Search size={14} /> Verify</button></>}><div><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>Certificate ID</label><input className="input" placeholder="CERT-NDPC-2026-XXXXX" value={verify} onChange={e => setVerify(e.target.value)} />{verifyResult && <div className="flex items-center gap-2 mt-4" style={{ padding: 12, borderRadius: 8, background: "color-mix(in srgb, var(--ndpc-green) 8%, var(--bg-elev))", border: "1px solid color-mix(in srgb, var(--ndpc-green) 25%, var(--line))" }}><CheckCircle size={16} style={{ color: "var(--ndpc-green)" }} /><span style={{ fontWeight: 500, color: "var(--ndpc-green)" }}>Valid certificate: {certUser(verifyResult)} · {certCourse(verifyResult)}</span></div>}{verifyError && <div className="flex items-center gap-2 mt-4" style={{ padding: 12, borderRadius: 8, background: "color-mix(in srgb, var(--ndpc-red) 8%, var(--bg-elev))", border: "1px solid color-mix(in srgb, var(--ndpc-red) 25%, var(--line))" }}><XCircle size={16} style={{ color: "var(--ndpc-red)" }} /><span style={{ fontWeight: 500, color: "var(--ndpc-red)" }}>{verifyError}</span></div>}</div></Modal>
    </div>
  );
}

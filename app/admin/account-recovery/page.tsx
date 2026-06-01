"use client";
import { ShieldAlert } from "lucide-react";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export default function AccountRecoveryPage() {
  return <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
    <div className="mb-5"><div className="id-mono">SECURITY · RECOVERY</div><h1 style={{ fontSize: 24, fontWeight: 600, margin: "6px 0 0" }}>Account Recovery</h1><p style={{ color: "var(--ink-3)", marginTop: 4 }}>Recovery requests are not exposed by the live backend yet.</p></div>
    <BackendPendingNotice label="account recovery workflow" />
    <div className="card"><EmptyState icon={ShieldAlert} title="Account recovery backend pending" description="Approval controls will appear only after the backend recovery workflow is available." /></div>
  </div>;
}

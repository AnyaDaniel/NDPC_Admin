"use client";
import { RefreshCw } from "lucide-react";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export default function ResetManagementPage() {
  return <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
    <div className="mb-5"><div className="id-mono">SECURITY · RESET</div><h1 style={{ fontSize: 24, fontWeight: 600, margin: "6px 0 0" }}>Reset Management</h1><p style={{ color: "var(--ink-3)", marginTop: 4 }}>Administrative reset routes are not exposed by the live backend yet.</p></div>
    <BackendPendingNotice label="reset management" />
    <div className="card"><EmptyState icon={RefreshCw} title="Reset management backend pending" description="Password and device reset actions will appear only after their backend routes are approved." /></div>
  </div>;
}

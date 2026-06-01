"use client";
import { CreditCard } from "lucide-react";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export default function PaymentsPage() {
  return <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
    <div className="mb-5"><div className="id-mono">COMMERCE · PAYMENTS</div><h1 style={{ fontSize: 24, fontWeight: 600, margin: "6px 0 0" }}>Payment Management</h1><p style={{ color: "var(--ink-3)", marginTop: 4 }}>Payment management is not exposed by the live backend yet.</p></div>
    <BackendPendingNotice label="payments" />
    <div className="card"><EmptyState icon={CreditCard} title="Payments backend pending" description="Live payment reconciliation and export controls will appear after an approved backend endpoint is deployed." /></div>
  </div>;
}

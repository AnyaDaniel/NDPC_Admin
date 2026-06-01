"use client";
import { UserCog } from "lucide-react";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export default function AdminAccountsPage() {
  return <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
    <div className="mb-5"><div className="id-mono">SYSTEM · ADMIN ACCOUNTS</div><h1 style={{ fontSize: 24, fontWeight: 600, margin: "6px 0 0" }}>Admin Accounts</h1><p style={{ color: "var(--ink-3)", marginTop: 4 }}>Admin account management is not exposed by the live backend yet.</p></div>
    <BackendPendingNotice label="admin account management" />
    <div className="card"><EmptyState icon={UserCog} title="Admin account management backend pending" description="Role and permission controls will appear only after the backend routes are approved." /></div>
  </div>;
}

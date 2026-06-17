"use client";
import { useMemo, useState } from "react";
import { KeyRound, RefreshCw, Shield } from "lucide-react";
import { adminApi, AdminUser } from "@/lib/admin-api";
import { useApiResource } from "@/lib/use-api-resource";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { UserCell } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { EmptyState } from "@/components/admin/ui/EmptyState";

type Tab = "all" | "learner" | "admin";

function userStatus(user: AdminUser) {
  return user.isEmailVerified === false ? "pending" : "active";
}

export default function UsersPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const { data, loading, error, reload } = useApiResource(() => adminApi.users({ pageSize: 100 }), []);
  const users = data?.users ?? [];

  const filtered = useMemo(() => users.filter(u => {
    if (tab !== "all" && u.role !== tab) return false;
    if (search && !`${u.name ?? ""} ${u.email} ${u.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [users, tab, search]);

  const counts = {
    all: users.length,
    learner: users.filter(u => u.role === "learner").length,
    admin: users.filter(u => u.role === "admin").length,
  };

  const resetPassword = async (user: AdminUser) => {
    const password = window.prompt(`Enter a new password for ${user.email}`);
    if (!password) return;
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    setResettingId(user.id);
    setMessage(null);
    try {
      await adminApi.resetUserPassword(user.id, password);
      setMessage(`Password reset for ${user.email}.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>PEOPLE · USERS</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>User Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Live users from the NDPC backend.</p>
        </div>
        <button className="btn" onClick={reload}><RefreshCw size={14} /> Refresh</button>
      </div>

      {message && <div className="card mb-4" style={{ padding: 14, color: message.startsWith("Unable") || message.startsWith("Password must") ? "var(--ndpc-red)" : "var(--ndpc-green)" }}>{message}</div>}

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all", label: "All users", count: counts.all },
          { value: "learner", label: "Learners", count: counts.learner },
          { value: "admin", label: "Admins", count: counts.admin },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by name, email, ID..." />
        {loading && <EmptyState icon={RefreshCw} title="Loading users" description="Fetching users from the backend." />}
        {error && <EmptyState icon={Shield} title="Unable to load users" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}
        {!loading && !error && filtered.length === 0 && <EmptyState title="No users found" description="Try another search or filter." />}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr><th>User</th><th>ID</th><th>Role</th><th>Status</th><th className="num">Devices</th><th>Verified</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td><UserCell name={u.name || u.email} sub={u.email} /></td>
                    <td><span className="id-mono">{u.id}</span></td>
                    <td>{u.role}</td>
                    <td><StatusBadge value={userStatus(u)} /></td>
                    <td className="num">{u.activeDevicesCount ?? 0} / {u.maxDevices ?? "-"}</td>
                    <td>{u.isEmailVerified ? "Yes" : "No"}</td>
                    <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</span></td>
                    <td><button className="btn btn-sm" disabled={resettingId === u.id} onClick={() => resetPassword(u)}><KeyRound size={12} /> {resettingId === u.id ? "Resetting..." : "Reset password"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

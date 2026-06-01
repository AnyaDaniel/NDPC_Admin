"use client";
import { useMemo, useState } from "react";
import { Download, FileText, RefreshCw, Shield, Users } from "lucide-react";
import { adminApi, DeviceLog } from "@/lib/admin-api";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { useApiResource } from "@/lib/use-api-resource";

function downloadCsv(logs: DeviceLog[]) {
  const rows = [["Time", "Actor", "Action", "Device code", "IP"], ...logs.map(log => [log.timestamp, log.userName ?? log.userId ?? "System", log.action, log.deviceCode ?? "", log.ipAddress ?? ""])];
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "ndpc-audit-logs.csv"; anchor.click(); URL.revokeObjectURL(url);
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const { data, loading, error, reload } = useApiResource(() => adminApi.deviceLogs({ pageSize: 200 }), []);
  const logs = data?.logs ?? [];
  const filtered = useMemo(() => logs.filter(log => !search || `${log.userName ?? ""} ${log.userId ?? ""} ${log.action} ${log.deviceCode ?? ""} ${log.ipAddress ?? ""}`.toLowerCase().includes(search.toLowerCase())), [logs, search]);
  const today = new Date().toDateString();
  const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
  const authEvents = logs.filter(log => /login|auth|activate|device/i.test(log.action));

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div><div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, color: "var(--ink-3)", marginBottom: 6 }}>SYSTEM · AUDIT</div><h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Audit Logs</h1><p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Latest immutable backend audit records.</p></div>
        <div className="flex gap-2"><button className="btn" disabled={!filtered.length} onClick={() => downloadCsv(filtered)}><Download size={14} /> Export CSV</button><button className="btn" onClick={reload}><RefreshCw size={14} /> Refresh</button></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Logs loaded" icon={FileText} value={logs.length} delta="latest backend records" sparkData={[1, 2, 3, 4]} />
        <StatCard eyebrow="Events today" icon={Shield} value={todayLogs.length} delta="backend audit logs" sparkData={[1, 2, 3, 4]} />
        <StatCard eyebrow="Auth and device events" icon={Users} value={authEvents.length} delta="loaded records" sparkData={[1, 2, 3, 4]} />
      </div>
      <div className="card">
        <FilterBar search={search} onSearch={setSearch} placeholder="Search actor, action, device or IP..." />
        {loading && <EmptyState icon={RefreshCw} title="Loading audit logs" />}
        {error && <EmptyState title="Unable to load audit logs" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}
        {!loading && !error && filtered.length === 0 && <EmptyState title="No audit logs found" />}
        {!loading && !error && filtered.length > 0 && <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Device code</th><th>IP</th></tr></thead><tbody>{filtered.map(log => <tr key={log.id}><td className="id-mono">{new Date(log.timestamp).toLocaleString()}</td><td>{log.userName ?? log.userId ?? "System"}</td><td>{log.action}</td><td className="id-mono">{log.deviceCode ?? "-"}</td><td className="id-mono">{log.ipAddress ?? "-"}</td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}

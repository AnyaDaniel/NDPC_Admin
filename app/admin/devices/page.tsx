"use client";
import { useMemo, useState } from "react";
import { Download, RefreshCw, Smartphone, Shield } from "lucide-react";
import { adminApi, DeviceLog } from "@/lib/admin-api";
import { useApiResource } from "@/lib/use-api-resource";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { StatCard } from "@/components/admin/ui/StatCard";

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const { data, loading, error, reload } = useApiResource(() => adminApi.deviceLogs({ pageSize: 100 }), []);
  const logs = data?.logs ?? [];
  const filtered = useMemo(() => logs.filter((d: DeviceLog) => !search || `${d.userName ?? ""} ${d.userId ?? ""} ${d.action} ${d.ipAddress ?? ""}`.toLowerCase().includes(search.toLowerCase())), [logs, search]);

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>PEOPLE · DEVICES</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Device Monitoring</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Live backend device/audit logs. Map tracking remains backend pending.</p>
        </div>
        <div className="flex gap-2"><button className="btn"><Download size={14} /> Export</button><button className="btn" onClick={reload}><RefreshCw size={14} /> Refresh</button></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Logs loaded" icon={Smartphone} value={logs.length} delta="backend" sparkData={[1,2,3,4,5,6,7]} />
        <StatCard eyebrow="Unique users" icon={Shield} value={new Set(logs.map(l => l.userId).filter(Boolean)).size} delta="from logs" sparkData={[1,2,2,3,3,4]} />
        <StatCard eyebrow="Map tracking" icon={Smartphone} value="Pending" delta="backend pending" sparkData={[1,1,1,1]} />
      </div>
      <div className="card">
        <FilterBar search={search} onSearch={setSearch} placeholder="Search logs by user, action, IP..." />
        {loading && <EmptyState icon={RefreshCw} title="Loading device logs" />}
        {error && <EmptyState title="Unable to load device logs" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}
        {!loading && !error && filtered.length === 0 && <EmptyState title="No device logs found" />}
        {!loading && !error && filtered.length > 0 && <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Device Code</th><th>IP</th></tr></thead><tbody>{filtered.map(l => <tr key={l.id}><td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{new Date(l.timestamp).toLocaleString()}</span></td><td>{l.userName ?? l.userId ?? "System"}</td><td>{l.action}</td><td><span className="id-mono">{l.deviceCode ?? "-"}</span></td><td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5 }}>{l.ipAddress ?? "-"}</span></td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}

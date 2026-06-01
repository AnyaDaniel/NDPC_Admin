"use client";
import Link from "next/link";
import { AlertTriangle, Award, BookOpen, Clock, Download, KeyRound, Plus, RefreshCw, Smartphone, Users, Zap } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { StatCard } from "@/components/admin/ui/StatCard";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { useApiResource } from "@/lib/use-api-resource";

function downloadSummary(rows: (string | number)[][]) {
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ndpc-dashboard-summary.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useApiResource(async () => {
    const [users, courses, logs, codes, certificates] = await Promise.all([
      adminApi.users({ pageSize: 100 }),
      adminApi.courses({ pageSize: 100 }),
      adminApi.deviceLogs({ pageSize: 20 }),
      adminApi.activationCodes({ pageSize: 100 }),
      adminApi.certificates(),
    ]);
    return { users, courses, logs, codes, certificates };
  }, []);

  const users = data?.users.users ?? [];
  const learners = users.filter(user => user.role === "learner");
  const courses = data?.courses.courses ?? [];
  const logs = data?.logs.logs ?? [];
  const codes = data?.codes.codes ?? [];
  const certificates = data?.certificates.certificates ?? [];
  const activeDevices = users.reduce((sum, user) => sum + (user.activeDevicesCount ?? 0), 0);
  const pendingCodes = codes.filter(code => code.status === "unused" || code.status === "active").length;
  const summaryRows: (string | number)[][] = [
    ["Metric", "Value"],
    ["Total users", data?.users.total ?? 0],
    ["Registered learners", learners.length],
    ["Active devices", activeDevices],
    ["Courses", data?.courses.total ?? 0],
    ["Published courses", courses.filter(course => course.isPublished).length],
    ["Available activation codes", pendingCodes],
    ["Certificates issued", certificates.length],
    ["Audit logs loaded", logs.length],
  ];

  return (
    <div className="page" style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>OVERVIEW · LIVE BACKEND</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Dashboard</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Operational totals and recent activity from the NDPC backend.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" disabled={!data} onClick={() => downloadSummary(summaryRows)}><Download size={14} /> Export summary</button>
          <Link className="btn btn-primary" href="/admin/uploads"><Plus size={14} /> Upload content</Link>
          <button className="btn btn-icon" onClick={reload} title="Refresh dashboard"><RefreshCw size={14} /></button>
        </div>
      </div>

      <BackendPendingNotice label="subscriptions, payments and revenue analytics" />
      {error && <EmptyState title="Unable to load dashboard" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}
      {!error && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
          <StatCard eyebrow="Total users" icon={Users} value={data?.users.total ?? 0} delta={`${learners.length} learners`} sparkData={[1, 2, 3, 4]} />
          <StatCard eyebrow="Active devices" icon={Smartphone} value={activeDevices} delta="live user devices" sparkData={[1, 2, 3, 4]} sparkColor="var(--ndpc-green)" />
          <StatCard eyebrow="Courses" icon={BookOpen} value={data?.courses.total ?? 0} delta={`${courses.filter(course => course.isPublished).length} published`} sparkData={[1, 2, 3, 4]} />
          <StatCard eyebrow="Available activation codes" icon={KeyRound} value={pendingCodes} delta="unused or active" sparkData={[1, 2, 3, 4]} sparkColor="var(--ndpc-amber)" />
          <StatCard eyebrow="Certificates issued" icon={Award} value={certificates.length} delta="backend certificates" sparkData={[1, 2, 3, 4]} />
          <StatCard eyebrow="Recent audit events" icon={Zap} value={logs.length} delta="latest loaded" sparkData={[1, 2, 3, 4]} />
          <StatCard eyebrow="Subscriptions" icon={Clock} value="Pending" delta="backend endpoint pending" sparkData={[1, 1]} />
          <StatCard eyebrow="Payments" icon={AlertTriangle} value="Pending" delta="backend endpoint pending" sparkData={[1, 1]} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>Top courses</div><div style={{ color: "var(--ink-3)", fontSize: 12 }}>Live course enrollment totals</div></div>
            {loading ? <EmptyState icon={RefreshCw} title="Loading courses" /> : courses.length === 0 ? <EmptyState title="No courses found" /> : <div style={{ padding: 16 }} className="flex flex-col gap-3">{[...courses].sort((a, b) => (b.enrolledCount ?? 0) - (a.enrolledCount ?? 0)).slice(0, 8).map(course => <div key={course.id} className="flex justify-between gap-4"><span>{course.title}</span><span className="id-mono">{course.enrolledCount ?? 0} enrolled</span></div>)}</div>}
          </div>

          <div className="card">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>Recent activity</div><div style={{ color: "var(--ink-3)", fontSize: 12 }}>Latest backend audit logs</div></div>
            {loading ? <EmptyState icon={RefreshCw} title="Loading activity" /> : logs.length === 0 ? <EmptyState title="No audit activity found" /> : <div>{logs.slice(0, 10).map(log => <div key={log.id} className="feed-item"><div className="feed-dot"><Zap size={12} /></div><div style={{ fontSize: 12.5, flex: 1 }}><b>{log.userName ?? "System"}</b><div style={{ color: "var(--ink-3)" }}>{log.action}</div></div><div className="id-mono">{new Date(log.timestamp).toLocaleString()}</div></div>)}</div>}
          </div>
        </div>
      </>}
    </div>
  );
}

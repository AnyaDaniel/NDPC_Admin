"use client";
import { Download, Users, Clock, CheckCircle, Zap, Send, RefreshCw } from "lucide-react";
import { adminApi, StudyTrackerLearner } from "@/lib/admin-api";
import { UserCell, Avatar } from "@/components/admin/ui/Avatar";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { useApiResource } from "@/lib/use-api-resource";
import { useState } from "react";

const PERIOD_DAYS: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };

function relativeTime(value: string | null) {
  if (!value) return "No activity recorded";
  const ms = Date.now() - new Date(value).getTime();
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor(ms / 60000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(0, minutes)}m ago`;
}

function downloadLearners(rows: StudyTrackerLearner[], period: string) {
  const lines = [
    ["Learner", "Email", "Events", "Lessons completed", "Courses completed", "Average progress", "Last seen"],
    ...rows.map(row => [row.name, row.email, row.events, row.lessonsCompleted, row.coursesCompleted, row.averageProgress.toFixed(2), row.lastSeen ?? ""]),
  ];
  const csv = lines.map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ndpc-study-tracker-${period}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Heatmap({ cells }: { cells: number[][] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(1, ...cells.flat());
  return (
    <div style={{ display: "grid", gridTemplateColumns: "16px repeat(24, 1fr)", gap: 2, fontFamily: "var(--font-geist-mono)", fontSize: 9, color: "var(--ink-3)" }}>
      <div />{[0, 3, 6, 9, 12, 15, 18, 21].map(hour => <div key={hour} style={{ gridColumn: "span 3", paddingBottom: 4 }}>{String(hour).padStart(2, "0")}</div>)}
      {days.map((day, dayIndex) => (
        <div key={`${day}-${dayIndex}`} style={{ display: "contents" }}>
          <div style={{ alignSelf: "center" }}>{day}</div>
          {(cells[dayIndex] ?? Array(24).fill(0)).map((value, hour) => <div key={hour} title={`${day} ${String(hour).padStart(2, "0")}:00 - ${value} events`} style={{ aspectRatio: "1/1", borderRadius: 2, background: `color-mix(in srgb, var(--ndpc-blue) ${Math.round(value / max * 100)}%, var(--bg-sunk))` }} />)}
        </div>
      ))}
    </div>
  );
}

export default function StudyTrackerPage() {
  const [period, setPeriod] = useState("7d");
  const days = PERIOD_DAYS[period];
  const { data, loading, error, reload } = useApiResource(() => adminApi.studyTracker(days), [days]);
  const learners = data?.learners ?? [];
  const atRisk = data?.atRiskLearners ?? [];
  const stats = data?.stats;

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>OVERVIEW · STUDY TRACKER</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Study Tracker</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Live learner progress and study activity from the backend.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div style={{ display: "inline-flex", padding: 3, background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 8, gap: 2 }}>
            {Object.keys(PERIOD_DAYS).map(value => <button key={value} onClick={() => setPeriod(value)} style={{ padding: "4px 10px", fontSize: 12.5, borderRadius: 5, height: 26, color: period === value ? "var(--ink)" : "var(--ink-3)", background: period === value ? "var(--bg-elev)" : "transparent" }}>{value}</button>)}
          </div>
          <button className="btn" disabled={!learners.length} onClick={() => downloadLearners(learners, period)}><Download size={14} /> Export</button>
          <button className="btn btn-icon" onClick={reload} title="Refresh tracker"><RefreshCw size={14} /></button>
        </div>
      </div>

      {error && <EmptyState title="Unable to load study tracker" description={error} action={<button className="btn" onClick={reload}>Retry</button>} />}
      {!error && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
          <StatCard eyebrow="Registered learners" icon={Users} value={stats?.registeredLearners ?? 0} delta="backend users" sparkData={[1, 2, 3, 4, 5]} />
          <StatCard eyebrow="Courses" icon={Clock} value={stats?.courses ?? 0} delta="backend courses" sparkData={[1, 2, 3, 4]} sparkColor="var(--ndpc-green)" />
          <StatCard eyebrow="Verified learners" icon={CheckCircle} value={stats?.verifiedLearners ?? 0} delta="backend users" sparkData={[1, 2, 3, 4]} />
          <StatCard eyebrow={`Study events · ${period}`} icon={Zap} value={stats?.studyEvents ?? 0} delta={`${stats?.activeLearners ?? 0} active learners`} sparkData={[1, 2, 3, 4, 5]} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>
          <div className="card">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}><div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, color: "var(--ink-3)" }}>LEADERBOARD · {period.toUpperCase()}</div><div style={{ fontWeight: 600, fontSize: 13.5 }}>Top learners</div></div>
            {loading ? <EmptyState icon={RefreshCw} title="Loading study activity" /> : learners.length === 0 ? <EmptyState title="No learner study activity recorded" /> : <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>#</th><th>Learner</th><th className="num">Events</th><th className="num">Lessons</th><th className="num">Courses</th><th>Last seen</th></tr></thead><tbody>{learners.map((learner, index) => <tr key={learner.id}><td>{String(index + 1).padStart(2, "0")}</td><td><UserCell name={learner.name} size="sm" /></td><td className="num">{learner.events}</td><td className="num">{learner.lessonsCompleted}</td><td className="num">{learner.coursesCompleted}</td><td>{relativeTime(learner.lastSeen)}</td></tr>)}</tbody></table></div>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="card"><div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}><div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, color: "var(--ink-3)" }}>HOUR × DAY</div><div style={{ fontWeight: 600, fontSize: 13.5 }}>Engagement heatmap</div></div><div style={{ padding: 16 }}><Heatmap cells={data?.heatmap ?? Array.from({ length: 7 }, () => Array(24).fill(0))} /></div></div>
            <div className="card"><div className="flex items-center justify-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>At-risk learners</div><span className="badge badge-warn">{atRisk.length}</span></div><div style={{ padding: "14px 16px" }} className="flex flex-col gap-3">{atRisk.length === 0 ? <span style={{ color: "var(--ink-3)", fontSize: 12.5 }}>No inactive enrolled learners in this period.</span> : atRisk.map(learner => <div key={learner.id} className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Avatar name={learner.name} size="sm" /><div><div style={{ fontSize: 13, fontWeight: 500 }}>{learner.name}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{relativeTime(learner.lastSeen)}</div></div></div><button className="btn btn-icon btn-ghost btn-sm" disabled title="Learner messaging backend pending"><Send size={13} /></button></div>)}</div></div>
          </div>
        </div>
      </>}
    </div>
  );
}

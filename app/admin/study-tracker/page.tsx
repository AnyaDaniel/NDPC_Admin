"use client";
import { useState } from "react";
import { Download, Users, Clock, CheckCircle, Zap, Send } from "lucide-react";
import { STUDY_LEADERS } from "@/lib/mock-data";
import { UserCell, Avatar } from "@/components/admin/ui/Avatar";
import { StatCard } from "@/components/admin/ui/StatCard";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * 100, y: 24 - ((v - min) / (max - min || 1)) * 20 - 2 }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ width: "100%", height: 24 }}><path d={line} fill="none" stroke="var(--ndpc-blue)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Heatmap() {
  const cells = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      let v = 0.15;
      if (h >= 7 && h < 9) v += 0.25;
      if (h >= 12 && h < 14) v += 0.18;
      if (h >= 19 && h < 22) v += 0.55 - (d >= 5 ? 0.1 : 0);
      return Math.min(1, v + ((d * 31 + h * 7) % 11) / 60);
    })
  );
  const days = ["M","T","W","T","F","S","S"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "16px repeat(24, 1fr)", gap: 2, fontFamily: "var(--font-geist-mono)", fontSize: 9, color: "var(--ink-3)" }}>
      <div />{[0,3,6,9,12,15,18,21].map(h => <div key={h} style={{ gridColumn: "span 3", paddingBottom: 4 }}>{String(h).padStart(2,"0")}</div>)}
      {days.map((dlabel, d) => (
        <>
          <div key={dlabel+d} style={{ alignSelf: "center" }}>{dlabel}</div>
          {cells[d].map((v, h) => <div key={h} style={{ aspectRatio: "1/1", borderRadius: 2, background: `color-mix(in srgb, var(--ndpc-blue) ${Math.round(v*100)}%, var(--bg-sunk))` }} />)}
        </>
      ))}
    </div>
  );
}

export default function StudyTrackerPage() {
  const [period, setPeriod] = useState("7d");

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>OVERVIEW · STUDY TRACKER</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Study Tracker</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Who&apos;s studying, how often, and where the streaks are forming.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div style={{ display: "inline-flex", padding: 3, background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 8, gap: 2 }}>
            {["24h","7d","30d","90d"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: "4px 10px", fontSize: 12.5, borderRadius: 5, height: 26, color: period === p ? "var(--ink)" : "var(--ink-3)", background: period === p ? "var(--bg-elev)" : "transparent", boxShadow: period === p ? "var(--shadow-card)" : "none" }}>{p}</button>
            ))}
          </div>
          <button className="btn"><Download size={14} /> Export</button>
        </div>
      </div>

      <BackendPendingNotice label="study tracking analytics" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Active learners (DAU)" icon={Users}       value="4,128"  delta="+6.2% WoW"  deltaDir="up" sparkData={[40,42,45,48,50,55,62]} />
        <StatCard eyebrow="Hours studied (7d)"    icon={Clock}       value="38,420" delta="+12% WoW"   deltaDir="up" sparkData={[3,4,5,6,7,8,9]} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Lessons completed"     icon={CheckCircle} value="22,184" delta="+8.4% WoW"  deltaDir="up" sparkData={[20,24,26,28,30,33,36]} />
        <StatCard eyebrow="Longest streak"        icon={Zap}         value="21"     suffix="days"      delta="Sade Ojo" sparkData={[5,8,10,14,17,19,21]} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>
        <div className="flex flex-col gap-4">
          {/* Top learners table */}
          <div className="card">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--ink-3)", letterSpacing: "0.1em" }}>LEADERBOARD · {period.toUpperCase()}</div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Top learners</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead><tr><th style={{ width: 40 }}>#</th><th>Learner</th><th className="num">Hours</th><th>Streak</th><th className="num">Lessons</th><th>Last seen</th></tr></thead>
                <tbody>
                  {STUDY_LEADERS.map((l, i) => (
                    <tr key={l.user}>
                      <td><span style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 600, color: i === 0 ? "var(--ndpc-amber)" : "var(--ink-3)" }}>{String(i+1).padStart(2,"0")}</span></td>
                      <td><UserCell name={l.user} size="sm" /></td>
                      <td className="num">{l.hours.toFixed(1)}h</td>
                      <td><span className="flex items-center gap-1"><span>{l.streak >= 14 ? "🔥" : "🔥"}</span><span style={{ fontFamily: "var(--font-geist-mono)" }}>{l.streak}d</span></span></td>
                      <td className="num">{l.lessons}</td>
                      <td style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{l.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Heatmap */}
          <div className="card">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--ink-3)", letterSpacing: "0.1em" }}>HOUR × DAY</div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Engagement heatmap</div>
            </div>
            <div style={{ padding: 16 }}>
              <Heatmap />
              <div className="flex items-center justify-between mt-2.5" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                <span>Less</span>
                <div className="flex gap-1">
                  {[0.1,0.3,0.5,0.7,0.9].map(o => <span key={o} style={{ width: 12, height: 12, borderRadius: 3, background: `color-mix(in srgb, var(--ndpc-blue) ${o*100}%, var(--bg-sunk))` }} />)}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* At-risk */}
          <div className="card">
            <div className="flex items-center justify-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>At-risk learners</div>
              <span className="badge badge-warn"><span className="dot" />14</span>
            </div>
            <div style={{ padding: "14px 16px" }} className="flex flex-col gap-3">
              {[["Emeka Nwosu","9 days inactive"],["Ngozi Obi","12 days inactive"],["Aisha Bello","Account pending"]].map(([n, s], i) => (
                <div key={n} className="flex items-center justify-between" style={{ paddingBottom: 10, borderBottom: i < 2 ? "1px solid var(--hairline)" : "none" }}>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={n} size="sm" />
                    <div><div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{s}</div></div>
                  </div>
                  <button className="btn btn-icon btn-ghost btn-sm"><Send size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

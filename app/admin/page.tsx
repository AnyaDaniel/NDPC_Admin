"use client";
import { Users, Zap, ShieldOff, Smartphone, Clock, CreditCard, AlertTriangle, Award, Download, Plus, TrendingUp, TrendingDown, ChevronRight, BookOpen, DollarSign } from "lucide-react";
import { StatCard } from "@/components/admin/ui/StatCard";
import { BackendPendingNotice } from "@/components/admin/ui/BackendPendingNotice";
import { ACTIVITY_FEED, PAYMENTS, NAIRA, COURSES } from "@/lib/mock-data";

const ENROL = [42,38,55,61,58,72,80,75,68,84,90,88,94,102,98,110,118,114,120,132,128,124,138,145,142,150,162,158,170,182];
const REVENUE = [180,220,200,260,240,300,320,310,340,360,380,410,400,430,450,460,490,510,500,530,560,580,600,620,640,660,690,710,740,780];
const FAIL = [3,2,4,3,5,2,3,4,2,3,5,4,3,2,3,4,3,2,3,5,4,3,2,2,3,4,3,2,3,4];

function AreaChart({ data, color, height = 160 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 400, h = height;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / (max - min || 1)) * (h - 8) - 4 }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height }}>
      <defs>
        <linearGradient id={`g-${color.replace(/[^a-z]/gi,"")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color.replace(/[^a-z]/gi,"")})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardPage() {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="page" style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      {/* Page head */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5" style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
            <span className="pulse" /> OVERVIEW · LIVE
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Welcome back, Harrison</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>12 events in the last hour · 3 items need attention · Lagos office time {time}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn"><Download size={14} /> Export report</button>
          <button className="btn btn-primary"><Plus size={14} /> Quick action</button>
        </div>
      </div>

      <BackendPendingNotice label="dashboard analytics and revenue metrics" />

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Total users"          icon={Users}        value="12,482" delta="+4.2% vs. last 7d" deltaDir="up"      sparkData={ENROL} />
        <StatCard eyebrow="Active users"         icon={Zap}          value="9,348"  delta="+2.1% vs. last 7d" deltaDir="up"      sparkData={ENROL.map(v=>v*0.7)} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Suspended"            icon={ShieldOff}    value="38"     delta="+6 this week"      deltaDir="down"    sparkData={[5,6,4,7,8,9,12]} sparkColor="var(--ndpc-red)" />
        <StatCard eyebrow="Active devices"       icon={Smartphone}   value="18,204" delta="+312 today"        deltaDir="up"      sparkData={ENROL.map((v,i)=>v+30+i)} />
        <StatCard eyebrow="Pending activations"  icon={Clock}        value="127"    delta="↑ 12"              deltaDir="up"      sparkData={[20,30,28,40,38,50,127]} sparkColor="var(--ndpc-amber)" />
        <StatCard eyebrow="Active subscriptions" icon={CreditCard}   value="8,941"  delta="+1.8% vs. 30d"    deltaDir="up"      sparkData={REVENUE} sparkColor="var(--ndpc-green)" />
        <StatCard eyebrow="Failed payments"      icon={AlertTriangle}value="23"     delta="−14% vs. last wk" deltaDir="down"    sparkData={FAIL} sparkColor="var(--ndpc-red)" />
        <StatCard eyebrow="Certificates issued"  icon={Award}        value="3,261"  delta="+42 today"        deltaDir="up"      sparkData={[80,90,110,140,160,180,220]} />
      </div>

      {/* Row 2: chart + right rail */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>
        <div className="flex flex-col gap-4">
          {/* Charts card */}
          <div className="card">
            <div className="flex items-center justify-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <div>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)" }}>LAST 30 DAYS</div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>Enrolments &amp; revenue</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-info"><span className="dot" style={{ background: "var(--ndpc-blue)" }} /> Enrolments</span>
                <span className="badge badge-success"><span className="dot" style={{ background: "var(--ndpc-green)" }} /> Revenue</span>
              </div>
            </div>
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>NEW ENROLMENTS</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>3,184</div>
                <div className="flex items-center gap-1 mt-1 text-xs font-mono" style={{ color: "var(--ndpc-green)" }}><TrendingUp size={11} /> +18.4% MoM</div>
                <div style={{ marginTop: 12 }}><AreaChart data={ENROL} color="var(--ndpc-blue)" height={160} /></div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>REVENUE (₦)</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>{NAIRA(28640000)}</div>
                <div className="flex items-center gap-1 mt-1 text-xs font-mono" style={{ color: "var(--ndpc-green)" }}><TrendingUp size={11} /> +22.1% MoM</div>
                <div style={{ marginTop: 12 }}><AreaChart data={REVENUE} color="var(--ndpc-green)" height={160} /></div>
              </div>
            </div>
          </div>

          {/* Content + Top courses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--ink-3)", letterSpacing: "0.1em" }}>UPLOADED</div>
                <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}><BookOpen size={14} /> Content library</div>
              </div>
              <div style={{ padding: 16 }}>
                <div className="flex flex-col gap-2.5">
                  {[["Videos", 412, "var(--ndpc-blue)"], ["PDFs & materials", 188, "var(--ndpc-green)"], ["Quizzes", 64, "var(--ndpc-amber)"]].map(([label, val, color]) => (
                    <div key={label as string}>
                      <div className="flex justify-between mb-1" style={{ fontSize: 12.5 }}>
                        <span>{label}</span>
                        <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--ink-3)" }}>{val}</span>
                      </div>
                      <div className="bar"><div className="bar-fill" style={{ width: `${(val as number) / 664 * 100}%`, background: color as string }} /></div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--hairline)", margin: "4px 0" }} />
                  <div className="flex justify-between" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    <span>Total storage</span>
                    <span style={{ fontFamily: "var(--font-geist-mono)" }}>184.2 GB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, textTransform: "uppercase", color: "var(--ink-3)", letterSpacing: "0.1em" }}>LAST 30 DAYS</div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>Top courses</div>
              </div>
              <div style={{ padding: 16 }} className="flex flex-col gap-3">
                {COURSES.filter(c => c.published).sort((a,b) => b.enrolled - a.enrolled).slice(0,4).map(c => (
                  <div key={c.id}>
                    <div className="flex justify-between mb-1.5" style={{ fontSize: 12.5 }}>
                      <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.title}</span>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--ink-3)", marginLeft: 8, flexShrink: 0 }}>{c.enrolled.toLocaleString()}</span>
                    </div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${c.enrolled / 2000 * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4">
          {/* Needs attention */}
          <div className="card">
            <div className="flex items-center justify-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Needs attention</div>
              <span className="badge badge-danger"><span className="dot" />3</span>
            </div>
            <div style={{ padding: "14px 16px" }} className="flex flex-col gap-2.5">
              {[
                { icon: AlertTriangle, tone: "danger", title: "23 failed payments",        sub: "Last failure: Aisha Bello · 4h ago" },
                { icon: Clock,         tone: "warn",   title: "127 pending activations",   sub: "Oldest: 6 days waiting" },
                { icon: AlertTriangle, tone: "warn",   title: "1 AI Tester request failed",sub: "Model timeout · AIS-9917" },
              ].map(({ icon: Ico, tone, title, sub }) => (
                <div key={title} className="flex items-center gap-2.5 rounded-lg" style={{ padding: 10, border: "1px solid var(--hairline)", background: tone === "danger" ? "color-mix(in srgb, var(--ndpc-red) 4%, var(--bg-elev))" : "color-mix(in srgb, var(--ndpc-amber) 4%, var(--bg-elev))" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0, background: tone === "danger" ? "color-mix(in srgb, var(--ndpc-red) 12%, var(--bg-elev))" : "color-mix(in srgb, var(--ndpc-amber) 12%, var(--bg-elev))", color: tone === "danger" ? "var(--ndpc-red)" : "var(--ndpc-amber)" }}>
                    <Ico size={14} />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sub}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--ink-3)" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card">
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Recent activity</div>
            </div>
            <div>
              {ACTIVITY_FEED.slice(0, 7).map((a, i) => (
                <div key={i} className="feed-item">
                  <div className="feed-dot">
                    <DollarSign size={13} />
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.45 }}
                    dangerouslySetInnerHTML={{ __html: a.text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\*(.*?)\*/g, "<span style='color:var(--ink-3);font-style:italic'>$1</span>") }}
                  />
                  <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, color: "var(--ink-3)", alignSelf: "start", paddingTop: 2, whiteSpace: "nowrap" }}>{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

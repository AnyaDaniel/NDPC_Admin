"use client";
import { useState } from "react";
import { Download, Pause, MapPin, Info, List, Map, Smartphone, Shield, RefreshCw, X, Navigation, Wifi } from "lucide-react";
import { DEVICES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { UserCell } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatCard } from "@/components/admin/ui/StatCard";
import { Modal } from "@/components/admin/ui/Modal";

type Tab = "all" | "active" | "suspended" | "deactivated";
type ViewMode = "table" | "map";

// Nigeria bounding box for coordinate normalisation
const LAT_MIN = 4.0, LAT_MAX = 14.0, LNG_MIN = 2.5, LNG_MAX = 15.0;

function toMapPos(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return { x, y };
}

// Simplified Nigeria outline as SVG path (approximate shape)
const NIGERIA_PATH = "M 12,92 L 8,88 L 5,82 L 4,75 L 7,70 L 5,62 L 8,55 L 12,52 L 10,45 L 14,38 L 18,34 L 22,30 L 28,25 L 34,22 L 40,20 L 46,18 L 52,16 L 58,18 L 64,17 L 70,20 L 76,22 L 82,26 L 88,30 L 91,36 L 94,43 L 96,50 L 94,57 L 90,63 L 88,70 L 86,76 L 82,80 L 76,84 L 70,86 L 64,88 L 58,90 L 52,92 L 46,93 L 40,92 L 34,91 L 28,92 L 22,93 L 16,93 Z";

const CITY_REFS = [
  { name: "Lagos",  lat: 6.5244,  lng: 3.3792  },
  { name: "Ibadan", lat: 7.3775,  lng: 3.9470  },
  { name: "Abuja",  lat: 9.0579,  lng: 7.4951  },
  { name: "Enugu",  lat: 6.4584,  lng: 7.5464  },
  { name: "Owerri", lat: 5.4836,  lng: 7.0346  },
  { name: "Kaduna", lat: 10.5227, lng: 7.4394  },
  { name: "Kano",   lat: 12.0022, lng: 8.5920  },
  { name: "Port Harcourt", lat: 4.8156, lng: 7.0498 },
  { name: "Maiduguri", lat: 11.8333, lng: 13.1500 },
  { name: "Sokoto", lat: 13.0059, lng: 5.2476  },
];

const STATUS_DOT: Record<string, string> = {
  active: "var(--ndpc-green)",
  suspended: "var(--ndpc-red)",
  deactivated: "var(--ink-4)",
};

function NigeriaMap({ devices, onSelect, selected }: {
  devices: typeof DEVICES;
  onSelect: (d: typeof DEVICES[0] | null) => void;
  selected: typeof DEVICES[0] | null;
}) {
  const [hover, setHover] = useState<typeof DEVICES[0] | null>(null);

  // Group devices by location for cluster display
  const grouped = devices.reduce((acc, d) => {
    const key = `${d.lat},${d.lng}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {} as Record<string, typeof DEVICES>);

  const active = hover || selected;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, height: 560 }}>
      {/* Map canvas */}
      <div style={{ position: "relative", background: "var(--bg-sunk)", border: "1px solid var(--hairline)", borderRadius: 12, overflow: "hidden" }}>
        {/* Grid lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
          {[20, 40, 60, 80].map(v => (
            <g key={v}>
              <line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke="var(--ink-3)" strokeWidth="1" />
              <line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="var(--ink-3)" strokeWidth="1" />
            </g>
          ))}
        </svg>

        {/* Nigeria outline */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d={NIGERIA_PATH} fill="color-mix(in srgb, var(--ndpc-blue) 6%, var(--bg-sunk))" stroke="var(--ndpc-blue)" strokeWidth="0.5" opacity="0.6" />
        </svg>

        {/* Watermark */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.5 }}>NIGERIA</span>
        </div>

        {/* City reference dots */}
        {CITY_REFS.map(city => {
          const pos = toMapPos(city.lat, city.lng);
          return (
            <div key={city.name} style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ink-4)", opacity: 0.4 }} />
              <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontFamily: "var(--font-geist-mono)", fontSize: 9, color: "var(--ink-4)", opacity: 0.5 }}>{city.name}</div>
            </div>
          );
        })}

        {/* Device pins */}
        {Object.entries(grouped).map(([key, group]) => {
          const d = group[0];
          const pos = toMapPos(d.lat, d.lng);
          const isSelected = selected?.lat === d.lat && selected?.lng === d.lng;
          const isHover = hover?.lat === d.lat && hover?.lng === d.lng;
          const color = STATUS_DOT[d.status] ?? "var(--ink-3)";
          const count = group.length;

          return (
            <div
              key={key}
              onClick={() => onSelect(isSelected ? null : d)}
              onMouseEnter={() => setHover(d)}
              onMouseLeave={() => setHover(null)}
              style={{
                position: "absolute",
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -100%)",
                cursor: "pointer",
                zIndex: isSelected || isHover ? 20 : 10,
              }}
            >
              {/* Pin body */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: count > 1 ? 36 : 30, height: count > 1 ? 36 : 30,
                  borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)",
                  background: isSelected ? color : `color-mix(in srgb, ${color} 85%, #fff)`,
                  border: `2px solid ${color}`,
                  boxShadow: isSelected ? `0 0 0 3px color-mix(in srgb, ${color} 30%, transparent), 0 4px 12px rgba(0,0,0,0.2)` : "0 2px 6px rgba(0,0,0,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s ease",
                }}>
                  <span style={{ transform: "rotate(45deg)", fontSize: count > 1 ? 11 : 13, fontWeight: 700, color: isSelected ? "white" : color }}>
                    {count > 1 ? count : <Smartphone size={12} style={{ color: isSelected ? "white" : color }} />}
                  </span>
                </div>
                <div style={{ width: 2, height: 8, background: color, opacity: 0.7 }} />
              </div>

              {/* Tooltip */}
              {(isHover || isSelected) && (
                <div style={{
                  position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
                  background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 8,
                  padding: "8px 10px", whiteSpace: "nowrap", boxShadow: "var(--shadow-pop)",
                  fontSize: 12, minWidth: 180, zIndex: 30,
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.city}</div>
                  {group.map(dev => (
                    <div key={dev.id} className="flex items-center gap-1.5" style={{ marginBottom: 3 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[dev.status], flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11 }}>{dev.id}</span>
                      <span style={{ color: "var(--ink-3)", fontSize: 11 }}>{dev.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ position: "absolute", bottom: 12, left: 12, background: "var(--bg-elev)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
          {[["active","Active"], ["suspended","Suspended"], ["deactivated","Deactivated"]].map(([s, l]) => (
            <div key={s} className="flex items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_DOT[s] }} />
              <span style={{ fontSize: 11, color: "var(--ink-2)" }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Coordinate watermark */}
        <div style={{ position: "absolute", bottom: 10, right: 12, fontFamily: "var(--font-geist-mono)", fontSize: 9, color: "var(--ink-4)", opacity: 0.6 }}>
          IP-based · city level only
        </div>
      </div>

      {/* Side panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
          {active ? "Selected device" : `${devices.length} devices`}
        </div>

        {active ? (
          <div style={{ background: "var(--bg-elev)", border: "1px solid var(--hairline)", borderRadius: 10, padding: 14 }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{active.name}</div>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{active.id}</div>
              </div>
              <button onClick={() => onSelect(null)} style={{ color: "var(--ink-3)", lineHeight: 1 }}><X size={14} /></button>
            </div>
            <StatusBadge value={active.status} />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                ["User",      active.user],
                ["Platform",  active.platform],
                ["Last seen", active.last],
                ["IP",        active.ip.split(" · ")[0]],
                ["City",      active.city],
                ["Lat / Lng", `${active.lat}° N, ${active.lng}° E`],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 12.5, fontFamily: l === "IP" || l === "Lat / Lng" ? "var(--font-geist-mono)" : undefined }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
              <button className="btn btn-sm" style={{ flex: 1 }}><Navigation size={12} /> Locate</button>
              <button className="btn btn-sm" style={{ flex: 1 }}><Pause size={12} /> Suspend</button>
            </div>
          </div>
        ) : (
          devices.map(d => {
            const color = STATUS_DOT[d.status];
            return (
              <button
                key={d.id}
                onClick={() => onSelect(d)}
                style={{
                  textAlign: "left", background: "var(--bg-elev)", border: "1px solid var(--hairline)",
                  borderRadius: 8, padding: "10px 12px", cursor: "pointer",
                  transition: "border-color 0.14s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ndpc-blue)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--hairline)")}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{d.name}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>{d.city}</span>
                </div>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>{d.user}</div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const [tab, setTab]       = useState<Tab>("all");
  const [view, setView]     = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [logFor, setLogFor] = useState<typeof DEVICES[0] | null>(null);
  const [mapSel, setMapSel] = useState<typeof DEVICES[0] | null>(null);

  const filtered = DEVICES.filter(d => {
    if (tab !== "all" && d.status !== tab) return false;
    if (search && !`${d.user} ${d.name} ${d.id} ${d.platform} ${d.city}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all:         DEVICES.length,
    active:      DEVICES.filter(d => d.status === "active").length,
    suspended:   DEVICES.filter(d => d.status === "suspended").length,
    deactivated: DEVICES.filter(d => d.status === "deactivated").length,
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>PEOPLE · DEVICES</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Device Monitoring</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Every registered device — platform, last activity, and geolocation.</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* View toggle */}
          <div style={{ display: "inline-flex", padding: 3, background: "var(--bg-sunk)", border: "1px solid var(--line)", borderRadius: 8, gap: 2 }}>
            {([["table", List], ["map", Map]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={v.charAt(0).toUpperCase() + v.slice(1) + " view"}
                style={{ display: "grid", placeItems: "center", width: 30, height: 26, borderRadius: 5, color: view === v ? "var(--ink)" : "var(--ink-3)", background: view === v ? "var(--bg-elev)" : "transparent", boxShadow: view === v ? "var(--shadow-card)" : "none" }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
          <button className="btn"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <StatCard eyebrow="Active devices"        icon={Smartphone} value="18,204" delta="+312 today"        deltaDir="up"   sparkData={[50,60,70,80,90,100,110].map(v=>v*10)} />
        <StatCard eyebrow="Suspended"             icon={Shield}     value="82"     delta="+2 today"          deltaDir="down" sparkData={[1,1,2,2,3,2,2]} sparkColor="var(--ndpc-red)" />
        <StatCard eyebrow="Reactivation requests" icon={RefreshCw}  value="19"     delta="3 awaiting review" sparkData={[3,2,3,4,3,5,4]} sparkColor="var(--ndpc-amber)" />
      </div>

      {/* Tabs + filter bar (table only) */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ padding: "10px 14px 0", borderBottom: "1px solid var(--hairline)", gap: 12 }}>
          <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
            { value: "all",         label: "All",         count: counts.all },
            { value: "active",      label: "Active",      count: counts.active },
            { value: "suspended",   label: "Suspended",   count: counts.suspended },
            { value: "deactivated", label: "Deactivated", count: counts.deactivated },
          ]} />
          <div className="flex items-center gap-2 pb-2">
            <Wifi size={13} style={{ color: "var(--ndpc-green)" }} />
            <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>IP-based geo · city level</span>
          </div>
        </div>

        {view === "table" ? (
          <>
            <FilterBar search={search} onSearch={setSearch} placeholder="Search by device, user, city, IP…">
              <select className="field" style={{ minWidth: 130 }}>
                <option>All platforms</option><option>iOS</option><option>Android</option><option>Web</option>
              </select>
              <select className="field" style={{ minWidth: 130 }}>
                <option>Any time</option><option>Last 24h</option><option>Last 7d</option>
              </select>
            </FilterBar>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Device</th><th>ID</th><th>User</th><th>Platform</th><th>Status</th>
                    <th>Last active</th><th>IP · Location</th><th>Coordinates</th><th style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--bg-sunk)", border: "1px solid var(--hairline)", display: "grid", placeItems: "center" }}>
                            <Smartphone size={13} style={{ color: "var(--ink-3)" }} />
                          </div>
                          <span style={{ fontWeight: 500 }}>{d.name}</span>
                        </div>
                      </td>
                      <td><span className="id-mono">{d.id}</span></td>
                      <td><UserCell name={d.user} sub={d.uid} size="sm" /></td>
                      <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12 }}>{d.platform}</span></td>
                      <td><StatusBadge value={d.status} /></td>
                      <td><span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{d.last}</span></td>
                      <td>
                        <div>
                          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-2)" }}>{d.ip.split(" · ")[0]}</div>
                          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{d.city}</div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, color: "var(--ink-3)" }}>
                          {d.lat.toFixed(4)}°N {d.lng.toFixed(4)}°E
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1 items-center">
                          <button className="btn btn-icon btn-ghost btn-sm" title="View logs" onClick={() => setLogFor(d)}><Info size={13} /></button>
                          <button className="btn btn-icon btn-ghost btn-sm" title="Show on map" onClick={() => { setView("map"); setMapSel(d); }}>
                            <MapPin size={13} />
                          </button>
                          <button className="btn btn-icon btn-ghost btn-sm" title="Suspend"><Pause size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ padding: 16 }}>
            <NigeriaMap devices={filtered} onSelect={setMapSel} selected={mapSel} />
          </div>
        )}
      </div>

      {/* Logs modal */}
      <Modal open={!!logFor} onClose={() => setLogFor(null)} size="lg"
        title={logFor ? `Device logs · ${logFor.id} · ${logFor.name}` : ""}
        footer={<button className="btn" onClick={() => setLogFor(null)}>Close</button>}>
        {logFor && (
          <div className="flex flex-col gap-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                ["User",        logFor.user],
                ["Platform",    logFor.platform],
                ["Status",      logFor.status],
                ["Last seen",   logFor.last],
                ["IP",          logFor.ip.split(" · ")[0]],
                ["City",        logFor.city],
                ["Coordinates", `${logFor.lat}° N, ${logFor.lng}° E`],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontFamily: l === "Coordinates" || l === "IP" ? "var(--font-geist-mono)" : undefined }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ overflowX: "auto", border: "1px solid var(--hairline)", borderRadius: 8 }}>
              <table className="tbl">
                <thead><tr><th>Time</th><th>Event</th><th>IP</th><th>App</th></tr></thead>
                <tbody>
                  {[
                    ["2026-05-12 09:42", "session.start",  "102.89.34.12", "ndpc-mobile@1.8.2"],
                    ["2026-05-12 09:41", "auth.success",   "102.89.34.12", "ndpc-mobile@1.8.2"],
                    ["2026-05-11 21:08", "session.end",    "102.89.34.12", "ndpc-mobile@1.8.2"],
                    ["2026-05-11 18:33", "lesson.view",    "102.89.34.12", "ndpc-mobile@1.8.2"],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{r[0]}</td>
                      <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12 }}>{r[1]}</td>
                      <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5 }}>{r[2]}</td>
                      <td style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5 }}>{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

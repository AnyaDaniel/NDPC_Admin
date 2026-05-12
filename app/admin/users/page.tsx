"use client";
import { useState } from "react";
import { Upload, Plus, MoreHorizontal, Send, RefreshCw, Shield, Pause, Check, X } from "lucide-react";
import { USERS, NAIRA, DEVICES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { UserCell, Avatar } from "@/components/admin/ui/Avatar";
import { FilterBar } from "@/components/admin/ui/FilterBar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { Drawer } from "@/components/admin/ui/Drawer";

type Tab = "all" | "active" | "suspended" | "pending";

export default function UsersPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<typeof USERS[0] | null>(null);
  const [drawerTab, setDrawerTab] = useState("overview");

  const filtered = USERS.filter(u => {
    if (tab !== "all" && u.status !== tab) return false;
    if (search && !`${u.name} ${u.email} ${u.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: USERS.length,
    active: USERS.filter(u => u.status === "active").length,
    suspended: USERS.filter(u => u.status === "suspended").length,
    pending: USERS.filter(u => u.status === "pending").length,
  };

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>PEOPLE · USERS</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>User Management</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Search, suspend, reset devices, and view enrolments across every learner and tutor.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn"><Upload size={14} /> Import CSV</button>
          <button className="btn btn-primary"><Plus size={14} /> Invite user</button>
        </div>
      </div>

      <div className="card">
        <Tabs value={tab} onChange={v => setTab(v as Tab)} tabs={[
          { value: "all",       label: "All users",  count: counts.all },
          { value: "active",    label: "Active",     count: counts.active },
          { value: "suspended", label: "Suspended",  count: counts.suspended },
          { value: "pending",   label: "Pending",    count: counts.pending },
        ]} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search by name, email, ID…" />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th><th>ID</th><th>Role</th><th>Status</th>
                <th className="num">Devices</th><th className="num">Courses</th><th className="num">Certs</th>
                <th>Plan</th><th className="num">Spend</th><th>Joined</th><th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ cursor: "pointer" }} onClick={() => { setSel(u); setDrawerTab("overview"); }}>
                  <td><UserCell name={u.name} sub={u.email} /></td>
                  <td><span className="id-mono">{u.id}</span></td>
                  <td>{u.role}</td>
                  <td><StatusBadge value={u.status} /></td>
                  <td className="num">{u.devices}</td>
                  <td className="num">{u.courses}</td>
                  <td className="num">{u.certs}</td>
                  <td>{u.plan}</td>
                  <td className="num">{u.spend ? NAIRA(u.spend) : "—"}</td>
                  <td><span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{u.joined}</span></td>
                  <td><button className="btn btn-icon btn-ghost btn-sm" onClick={e => e.stopPropagation()}><MoreHorizontal size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between" style={{ padding: "10px 14px", color: "var(--ink-3)", fontSize: 12.5 }}>
          <span>Showing {filtered.length} of {USERS.length}</span>
          <div className="flex gap-2">
            <button className="btn btn-sm">Previous</button>
            <button className="btn btn-sm">Next</button>
          </div>
        </div>
      </div>

      {/* User drawer */}
      <Drawer open={!!sel} onClose={() => setSel(null)}>
        {sel && (
          <>
            <div className="flex items-center justify-between" style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div className="flex items-center gap-3">
                <Avatar name={sel.name} size="lg" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{sel.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="id-mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sel.id}</span>
                    <StatusBadge value={sel.status} />
                    <span className="badge badge-muted">{sel.role}</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSel(null)}><X size={16} /></button>
            </div>

            <div className="flex gap-2 flex-wrap" style={{ padding: "10px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <button className="btn btn-sm"><Send size={12} /> Send email</button>
              <button className="btn btn-sm"><RefreshCw size={12} /> Reset devices</button>
              <button className="btn btn-sm"><Shield size={12} /> Change role</button>
              {sel.status === "active"
                ? <button className="btn btn-sm btn-danger"><Pause size={12} /> Suspend</button>
                : <button className="btn btn-sm"><Check size={12} /> Activate</button>}
            </div>

            <div style={{ padding: "0 18px" }}>
              <Tabs value={drawerTab} onChange={setDrawerTab} tabs={[
                { value: "overview", label: "Overview" },
                { value: "courses",  label: "Courses",  count: sel.courses },
                { value: "devices",  label: "Devices",  count: sel.devices },
                { value: "billing",  label: "Billing" },
              ]} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
              {drawerTab === "overview" && (
                <div className="flex flex-col gap-4">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[["Email", sel.email], ["Phone", "+234 803 555 0142"], ["Plan", sel.plan], ["Joined", sel.joined], ["Lifetime spend", sel.spend ? NAIRA(sel.spend) : "—"], ["Last login", "May 12, 09:18"]].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 4 }}>{l}</div>
                        <div style={{ fontSize: 13.5 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {drawerTab === "courses" && (
                <div className="flex flex-col gap-2.5">
                  {[["Customer Service Excellence", 1.0, "Completed"], ["Foundations of Nigerian Tax Law", 0.72, "In progress"], ["Data Protection & NDPR Practice", 0.43, "In progress"]].map(([t, v, s]) => (
                    <div key={t as string} className="card" style={{ padding: 12 }}>
                      <div className="flex justify-between mb-2">
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{t}</div>
                        <span className="badge badge-muted">{s}</span>
                      </div>
                      <div className="bar"><div className="bar-fill" style={{ width: `${(v as number) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
              {drawerTab === "devices" && (
                <div className="flex flex-col gap-2.5">
                  {DEVICES.filter(d => d.uid === sel.id).map(d => (
                    <div key={d.id} className="card" style={{ padding: 12 }}>
                      <div className="flex justify-between">
                        <div>
                          <div style={{ fontWeight: 500 }}>{d.name}</div>
                          <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>{d.platform} · {d.id}</div>
                        </div>
                        <StatusBadge value={d.status} />
                      </div>
                      <div className="flex gap-3 mt-2" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        <span>{d.last}</span> · <span>{d.ip}</span>
                      </div>
                    </div>
                  ))}
                  {DEVICES.filter(d => d.uid === sel.id).length === 0 && (
                    <p style={{ color: "var(--ink-3)", fontSize: 13, textAlign: "center", padding: 24 }}>No devices on this account yet.</p>
                  )}
                </div>
              )}
              {drawerTab === "billing" && (
                <div className="card" style={{ padding: 14 }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11.5, color: "var(--ink-3)" }}>SUB-44021</div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{sel.plan} · {NAIRA(sel.spend || 0)}/yr</div>
                    </div>
                    <StatusBadge value="active" />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-sm">Extend</button>
                    <button className="btn btn-sm btn-danger">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

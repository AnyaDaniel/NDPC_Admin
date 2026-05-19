"use client";
import { useEffect, useState } from "react";
import { Save, Eye, EyeOff, Bell, Moon, Sun, Shield, Smartphone, Activity, Plus, Trash2 } from "lucide-react";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Tabs } from "@/components/admin/ui/Tabs";
import { AdminDensity, AdminTheme, applyAppearance, readDensity, readTheme } from "@/lib/appearance";

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [showPw, setShowPw] = useState(false);
  const [theme, setTheme] = useState<AdminTheme>("light");
  const [density, setDensity] = useState<AdminDensity>("comfortable");
  const [notifs, setNotifs] = useState({ email: true, push: true, failedPayments: true, newUsers: false, certIssued: true, systemAlerts: true });

  const toggle = (key: keyof typeof notifs) => setNotifs(n => ({ ...n, [key]: !n[key] }));

  useEffect(() => {
    const storedTheme = readTheme();
    const storedDensity = readDensity();
    setTheme(storedTheme);
    setDensity(storedDensity);
    applyAppearance(storedTheme, storedDensity);
  }, []);

  const setAppearanceTheme = (nextTheme: AdminTheme) => {
    setTheme(nextTheme);
    applyAppearance(nextTheme, density);
  };

  const setAppearanceDensity = (nextDensity: AdminDensity) => {
    setDensity(nextDensity);
    applyAppearance(theme, nextDensity);
  };

  const densityVariants = {
    compact: {
      color: "var(--density-accent)",
      lightBg: "color-mix(in srgb, var(--density-accent) 12%, var(--bg-elev))",
      darkBg: "color-mix(in srgb, var(--density-accent) 18%, var(--bg-elev))",
    },
    comfortable: {
      color: "var(--density-accent)",
      lightBg: "color-mix(in srgb, var(--density-accent) 12%, var(--bg-elev))",
      darkBg: "color-mix(in srgb, var(--density-accent) 18%, var(--bg-elev))",
    },
    roomy: {
      color: "var(--density-accent)",
      lightBg: "color-mix(in srgb, var(--density-accent) 12%, var(--bg-elev))",
      darkBg: "color-mix(in srgb, var(--density-accent) 18%, var(--bg-elev))",
    },
  } as const;

  return (
    <div style={{ padding: "20px 24px 64px", maxWidth: 1480, margin: "0 auto" }}>
      <div className="mb-5">
        <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 6 }}>SYSTEM · SETTINGS</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>Admin Settings</h1>
        <p style={{ color: "var(--ink-3)", marginTop: 4, fontSize: 13.5 }}>Manage your admin profile, security and personal preferences.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left nav */}
        <div className="card" style={{ padding: 8 }}>
          {[
            { value: "profile",   label: "Admin Profile" },
            { value: "password",  label: "Change Password" },
            { value: "notifs",    label: "Notifications" },
            { value: "theme",     label: "Appearance" },
            { value: "2fa",       label: "Two-Factor Auth" },
            { value: "sessions",  label: "Sessions & Devices" },
            { value: "activity",  label: "Personal Activity Log" },
          ].map(item => (
            <button key={item.value} className={`sb-item ${tab === item.value ? "active" : ""}`} onClick={() => setTab(item.value)} style={{ width: "100%" }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div className="card" style={{ padding: "20px 24px" }}>
          {tab === "profile" && (
            <div className="flex flex-col gap-4">
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Admin Profile</h2>
              <div className="flex items-center gap-4">
                <Avatar name="Harrison Oloye" size="lg" />
                <button className="btn btn-sm">Change photo</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[["Full name", "Harrison Oloye"], ["Email", "h.oloye@ndpc.ng"], ["Role", "Super Admin"], ["Department", "Technology"]].map(([l, v]) => (
                  <div key={l}><label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>{l}</label><input className="input" defaultValue={v} /></div>
                ))}
              </div>
              <div className="flex justify-end"><button className="btn btn-primary"><Save size={14} /> Save changes</button></div>
            </div>
          )}

          {tab === "password" && (
            <div className="flex flex-col gap-4" style={{ maxWidth: 460 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Change Password</h2>
              {[["Current password", "currentPw"], ["New password", "newPw"], ["Confirm new password", "confirmPw"]].map(([l, k]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>{l}</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" type={showPw ? "text" : "password"} style={{ paddingRight: 40 }} placeholder="••••••••••" />
                    <button onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ padding: 12, borderRadius: 8, background: "var(--bg-sunk)", fontSize: 12.5, color: "var(--ink-3)" }}>
                Password must be at least 12 characters and include uppercase, lowercase, numbers and special characters.
              </div>
              <div className="flex justify-end"><button className="btn btn-primary"><Save size={14} /> Update password</button></div>
            </div>
          )}

          {tab === "notifs" && (
            <div className="flex flex-col gap-4">
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Notification Settings</h2>
              {[
                { key: "email",         label: "Email notifications",      desc: "Receive alerts by email" },
                { key: "push",          label: "Push notifications",       desc: "In-browser push alerts" },
                { key: "failedPayments",label: "Failed payment alerts",    desc: "Notify on payment failures" },
                { key: "newUsers",      label: "New user registrations",   desc: "Notify when new users join" },
                { key: "certIssued",    label: "Certificate issued",       desc: "Notify on certificate issuance" },
                { key: "systemAlerts",  label: "System alerts",            desc: "Critical system events" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between" style={{ padding: "12px 0", borderBottom: "1px solid var(--hairline)" }}>
                  <div><div style={{ fontWeight: 500 }}>{label}</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{desc}</div></div>
                  <button onClick={() => toggle(key as keyof typeof notifs)}
                    style={{ width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", background: notifs[key as keyof typeof notifs] ? "var(--ndpc-blue)" : "var(--line-2)", transition: "background 0.2s", position: "relative" }}>
                    <span style={{ position: "absolute", top: 3, left: notifs[key as keyof typeof notifs] ? 20 : 4, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "theme" && (
            <div className="flex flex-col gap-6">
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Appearance</h2>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 12 }}>Theme</div>
                <div className="flex gap-3">
                  {(["light","dark"] as const).map(t => {
                    const selected = theme === t;
                    const themeBorder = selected ? (t === "light" ? "var(--ndpc-amber)" : "var(--ndpc-green)") : "var(--line)";
                    const themeBg = selected
                      ? t === "light"
                        ? "linear-gradient(160deg, color-mix(in srgb, var(--ndpc-amber) 16%, white), color-mix(in srgb, var(--ndpc-blue) 12%, white))"
                        : "linear-gradient(160deg, color-mix(in srgb, var(--ndpc-green) 18%, #14162a), color-mix(in srgb, var(--ndpc-blue) 16%, #14162a))"
                      : "var(--bg-elev)";

                    return (
                      <button key={t} onClick={() => setAppearanceTheme(t)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl"
                        style={{ border: `2px solid ${themeBorder}`, background: themeBg, cursor: "pointer" }}>
                        {t === "light" ? <Sun size={20} /> : <Moon size={20} />}
                        <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 12 }}>Density</div>
                <div className="flex gap-2">
                  {(["compact","comfortable","roomy"] as AdminDensity[]).map(d => {
                    const variant = densityVariants[d as keyof typeof densityVariants];
                    const selected = density === d;
                    const background = selected ? (theme === "light" ? variant.lightBg : variant.darkBg) : "var(--bg-elev)";
                    const borderColor = selected ? variant.color : "var(--line)";
                    const textColor = selected ? variant.color : "var(--ink-2)";

                    return (
                      <button key={d} onClick={() => setAppearanceDensity(d)}
                        className="btn"
                        style={{ borderColor, color: textColor, background, boxShadow: selected ? "0 0 0 1px rgba(0,0,0,0.05)" : undefined }}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "2fa" && (
            <div className="flex flex-col gap-4">
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Two-Factor Authentication</h2>
              <div style={{ padding: 16, borderRadius: 12, background: "var(--bg-sunk)", border: "1px solid var(--line)" }}>
                <div className="flex items-center gap-2 mb-2"><Shield size={18} style={{ color: "var(--ndpc-amber)" }} /><span style={{ fontWeight: 600 }}>2FA is not yet enabled</span></div>
                <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>Enable authenticator app, SMS or hardware key for additional sign-in security. {/* TODO: wire to backend 2FA endpoint */}</p>
              </div>
              <button className="btn btn-primary w-fit"><Shield size={14} /> Set up 2FA</button>
              <div style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-geist-mono)" }}>TODO: Integrate TOTP / SMS 2FA</div>
            </div>
          )}

          {tab === "sessions" && (
            <div className="flex flex-col gap-4">
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Sessions &amp; Devices</h2>
              {[
                { device: "MacBook Pro (Chrome)", ip: "102.89.34.12", location: "Lagos, NG", time: "Active now", current: true },
                { device: "iPhone 14 (Safari)",   ip: "102.89.34.12", location: "Lagos, NG", time: "3 hours ago", current: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: 14, borderRadius: 10, border: "1px solid var(--line)" }}>
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} style={{ color: "var(--ink-3)" }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.device} {s.current && <span className="badge badge-success" style={{ marginLeft: 6 }}>current</span>}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-geist-mono)" }}>{s.ip} · {s.location} · {s.time}</div>
                    </div>
                  </div>
                  {!s.current && <button className="btn btn-sm btn-danger"><Trash2 size={12} /> Revoke</button>}
                </div>
              ))}
            </div>
          )}

          {tab === "activity" && (
            <div className="flex flex-col gap-2">
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Personal Activity Log</h2>
              {[
                ["2026-05-12 09:42", "Suspended user Ngozi Obi"],
                ["2026-05-11 20:33", "Reset device activation for Adaeze Okafor"],
                ["2026-05-11 11:20", "Revoked certificate CERT-NDPC-2026-00179"],
                ["2026-05-11 09:00", "Login from 102.89.34.12"],
                ["2026-05-10 14:30", "Generated 10 activation codes"],
              ].map(([time, action], i) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
                  <Activity size={14} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
                  <div className="flex-1" style={{ fontSize: 13 }}>{action}</div>
                  <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap" }}>{time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

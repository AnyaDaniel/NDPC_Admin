"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { clearAdminSession, getAccessToken, getAdminUser } from "@/lib/api-client";

type AdminUser = { email?: string; name?: string; role?: string };

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("admin@ndpc.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getAccessToken()));
    setReady(true);
    const onExpired = () => setAuthed(false);
    window.addEventListener("ndpc-admin-auth-expired", onExpired);
    return () => window.removeEventListener("ndpc-admin-auth-expired", onExpired);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminApi.login(email.trim(), password);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;
  if (authed) return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--bg)" }}>
      <form onSubmit={submit} className="card" style={{ width: "min(420px, 100%)", padding: 22 }}>
        <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)", marginBottom: 8 }}>NDPC ADMIN</div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Sign in</h1>
        <p style={{ color: "var(--ink-3)", marginTop: 6, fontSize: 13 }}>Use an admin account. Tokens are stored locally in this browser only.</p>
        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <label>
            <span style={{ display: "block", fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Email</span>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>
            <span style={{ display: "block", fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Password</span>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && <div style={{ color: "var(--ndpc-red)", fontSize: 12.5 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: "center", width: "100%" }}>
            <LogIn size={14} /> {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AdminSessionMenu() {
  const [user, setUser] = useState<AdminUser | null>(null);
  useEffect(() => setUser(getAdminUser<AdminUser>()), []);
  const label = user?.name || user?.email || "Admin";
  return (
    <button
      className="flex items-center gap-2.5"
      onClick={() => { clearAdminSession(); window.location.reload(); }}
      title="Sign out"
      style={{ padding: "4px 8px 4px 4px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--bg-elev)" }}
    >
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, var(--ndpc-blue), var(--ndpc-blue-2))", color: "white", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11 }}>
        {label.slice(0, 1).toUpperCase()}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
    </button>
  );
}

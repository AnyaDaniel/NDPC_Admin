"use client";

export function BackendPendingNotice({ label }: { label: string }) {
  return (
    <div className="card" style={{ padding: "10px 14px", marginBottom: 16, borderStyle: "dashed", color: "var(--ink-3)", fontSize: 12.5 }}>
      <strong style={{ color: "var(--ink)" }}>Backend pending:</strong> {label}. This screen is using placeholder data until the approved backend endpoint exists.
    </div>
  );
}

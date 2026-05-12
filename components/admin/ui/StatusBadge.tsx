"use client";

type Status = "active" | "suspended" | "pending" | "expired" | "cancelled" | "failed" | "success" | "used" | "unused" | "deactivated" | "valid" | "revoked" | "processing" | "processed" | "approved" | "rejected" | "completed" | "locked" | string;

const MAP: Record<string, { cls: string; label?: string }> = {
  active:      { cls: "badge-success" },
  published:   { cls: "badge-success" },
  valid:       { cls: "badge-success" },
  success:     { cls: "badge-success" },
  processed:   { cls: "badge-success" },
  approved:    { cls: "badge-success" },
  completed:   { cls: "badge-success" },
  used:        { cls: "badge-info" },
  pending:     { cls: "badge-warn" },
  processing:  { cls: "badge-warn" },
  unused:      { cls: "badge-warn" },
  suspended:   { cls: "badge-danger" },
  revoked:     { cls: "badge-danger" },
  failed:      { cls: "badge-danger" },
  rejected:    { cls: "badge-danger" },
  locked:      { cls: "badge-danger" },
  expired:     { cls: "badge-muted" },
  cancelled:   { cls: "badge-muted" },
  deactivated: { cls: "badge-muted" },
  draft:       { cls: "badge-muted" },
};

export function StatusBadge({ value, label }: { value: Status; label?: string }) {
  const { cls } = MAP[value] ?? { cls: "badge-muted" };
  return (
    <span className={`badge ${cls}`}>
      <span className="dot" />
      {label ?? value}
    </span>
  );
}

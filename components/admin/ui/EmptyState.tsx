import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 px-6 text-center" style={{ color: "var(--ink-3)" }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, border: "1px dashed var(--line-2)", display: "grid", placeItems: "center" }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{title}</div>
        {description && <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{description}</div>}
      </div>
      {action}
    </div>
  );
}

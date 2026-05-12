const COLORS = [
  "#1E4CC4", "#16a34a", "#d97706", "#9333ea", "#dc2626",
  "#0891b2", "#7c3aed", "#b45309", "#15803d", "#1d4ed8",
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xfffffff;
  return COLORS[h % COLORS.length];
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 24 : size === "lg" ? 40 : 28;
  const fs  = size === "sm" ? 9  : size === "lg" ? 14  : 11;
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: dim, height: dim, borderRadius: "50%",
      background: colorFor(name), color: "white",
      display: "grid", placeItems: "center",
      fontWeight: 600, fontSize: fs, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export function UserCell({ name, sub, size = "md" }: { name: string; sub?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={name} size={size} />
      <div className="flex flex-col min-w-0">
        <span style={{ fontWeight: 500, fontSize: 13 }}>{name}</span>
        {sub && <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-geist-mono)" }}>{sub}</span>}
      </div>
    </div>
  );
}

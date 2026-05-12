"use client";

interface Tab { value: string; label: string; count?: number; }

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (v: string) => void;
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.value} className={`tab-btn ${value === t.value ? "active" : ""}`} onClick={() => onChange(t.value)}>
          {t.label}
          {t.count !== undefined && (
            <span style={{ marginLeft: 6, fontFamily: "var(--font-geist-mono)", fontSize: 10, color: "var(--ink-3)", background: "var(--bg-sunk)", padding: "1px 5px", borderRadius: 999, border: "1px solid var(--hairline)" }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

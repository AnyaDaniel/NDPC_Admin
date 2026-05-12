"use client";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  eyebrow: string;
  value: string | number;
  suffix?: string;
  delta?: string;
  deltaDir?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  sparkData?: number[];
  sparkColor?: string;
}

export function StatCard({ eyebrow, value, suffix, delta, deltaDir = "neutral", icon: Icon, sparkData, sparkColor }: StatCardProps) {
  const deltaClass = deltaDir === "up" ? "text-[var(--ndpc-green)]" : deltaDir === "down" ? "text-[var(--ndpc-red)]" : "text-[var(--ink-3)]";

  return (
    <div className="kpi-card">
      <div className="flex items-center gap-1.5 mb-1.5" style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
        {Icon && <Icon size={12} />}
        <span>{eyebrow}</span>
      </div>

      <div className="flex items-baseline gap-2" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
        {value}
        {suffix && <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 400 }}>{suffix}</span>}
      </div>

      {delta && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-mono ${deltaClass}`}>
          {deltaDir === "up" && <TrendingUp size={11} />}
          {deltaDir === "down" && <TrendingDown size={11} />}
          <span>{delta}</span>
        </div>
      )}

      {sparkData && (
        <svg className="absolute right-4 top-4 opacity-75" width={72} height={40} viewBox={`0 0 72 40`}>
          <polyline
            points={sparkData.map((v, i) => {
              const max = Math.max(...sparkData);
              const min = Math.min(...sparkData);
              const x = (i / (sparkData.length - 1)) * 72;
              const y = 40 - ((v - min) / (max - min || 1)) * 36 - 2;
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke={sparkColor ?? "var(--ndpc-blue)"}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

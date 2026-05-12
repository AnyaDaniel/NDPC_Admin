"use client";
import { Search } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export function FilterBar({ search, onSearch, placeholder = "Search…", children }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap" style={{ padding: "10px 14px", borderBottom: "1px solid var(--hairline)" }}>
      <div className="field" style={{ minWidth: 220 }}>
        <Search size={13} style={{ color: "var(--ink-3)" }} />
        <input
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "var(--ink)", flex: 1 }}
          placeholder={placeholder}
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      {children}
    </div>
  );
}

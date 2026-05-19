"use client";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AdminSessionMenu } from "@/components/admin/layout/AuthGate";
import { AdminTheme, applyAppearance, readDensity, readTheme } from "@/lib/appearance";

const CRUMBS: Record<string, [string, string]> = {
  "/admin":                  ["Overview", "Dashboard"],
  "/admin/study-tracker":    ["Overview", "Study Tracker"],
  "/admin/users":            ["People", "User Management"],
  "/admin/devices":          ["People", "Device Monitoring"],
  "/admin/subscriptions":    ["Commerce", "Subscriptions"],
  "/admin/payments":         ["Commerce", "Payments"],
  "/admin/activation-codes": ["Commerce", "Activation Codes"],
  "/admin/courses":          ["Learning", "Courses & Content"],
  "/admin/assessments":      ["Learning", "Tests & Exams"],
  "/admin/uploads":          ["Learning", "Uploads"],
  "/admin/certificates":     ["Learning", "Certificates"],
  "/admin/account-recovery": ["Security", "Account Recovery"],
  "/admin/reset-management": ["Security", "Reset Management"],
  "/admin/audit-logs":       ["System", "Audit Logs"],
  "/admin/settings":         ["System", "Settings"],
};

export function Topbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<AdminTheme>("light");
  const crumb = CRUMBS[pathname] ?? ["Admin", pathname.split("/").pop() ?? ""];

  useEffect(() => {
    const storedTheme = readTheme();
    const storedDensity = readDensity();
    setTheme(storedTheme);
    applyAppearance(storedTheme, storedDensity);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyAppearance(next, readDensity());
  };

  return (
    <header className="admin-header">
      <div className="flex items-center gap-3.5" style={{ height: 56, padding: "0 20px" }}>
        <div className="flex items-center gap-2" style={{ fontSize: 13, color: "var(--ink-3)" }}>
          <svg width="18" height="18" viewBox="0 0 30 30" fill="none">
            <rect width="30" height="30" rx="8" fill="#1E4CC4"/>
            <text x="15" y="21" textAnchor="middle" fontFamily="system-ui" fontWeight="700" fontSize="16" fill="white">N</text>
          </svg>
          <span>NDPC Admin</span>
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-4)" }}>/</span>
          <span>{crumb[0]}</span>
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "var(--ink-4)" }}>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{crumb[1]}</span>
        </div>
        <div className="flex-1" />
        <button className="flex items-center gap-2 hd-search" style={{ minWidth: 260, padding: "0 10px", height: 34, border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg-sunk)", color: "var(--ink-3)", fontSize: 13 }}>
          <Search size={14} />
          <span style={{ flex: 1, textAlign: "left" }}>Search users, payments, courses...</span>
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 4, padding: "1px 5px" }}>Ctrl K</span>
        </button>
        <button className="btn btn-icon" style={{ border: "1px solid var(--line)" }} onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="btn btn-icon" style={{ border: "1px solid var(--line)", position: "relative" }}>
          <Bell size={15} />
          <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: "var(--ndpc-blue)", border: "2px solid var(--bg-elev)" }} />
        </button>
        <div style={{ width: 1, height: 22, background: "var(--line)" }} />
        <AdminSessionMenu />
      </div>
    </header>
  );
}

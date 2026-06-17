"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Smartphone, KeyRound, BookOpen, Upload,
  Award, CreditCard, SubscriptIcon, ShieldAlert, RefreshCw, Settings,
  FileText, TrendingUp, UserCog, HelpCircle,
  Bell,
} from "lucide-react";

const NAV = [
  { section: "Overview", items: [
    { href: "/admin",              label: "Dashboard",          icon: LayoutDashboard },
    { href: "/admin/study-tracker",label: "Study Tracker",      icon: TrendingUp },
  ]},
  { section: "People", items: [
    { href: "/admin/users",        label: "User Management",    icon: Users },
    { href: "/admin/devices",      label: "Device Monitoring",  icon: Smartphone },
  ]},
  { section: "Commerce", items: [
    { href: "/admin/subscriptions",label: "Subscriptions",      icon: SubscriptIcon },
    { href: "/admin/payments",     label: "Payments",           icon: CreditCard },
    { href: "/admin/activation-codes", label: "Activation Codes", icon: KeyRound },
  ]},
  { section: "Learning", items: [
    { href: "/admin/courses",      label: "Courses & Content",  icon: BookOpen },
    { href: "/admin/assessments",  label: "Tests & Exams",      icon: HelpCircle },
    { href: "/admin/uploads",      label: "Uploads",            icon: Upload },
    { href: "/admin/certificates", label: "Certificates",       icon: Award },
  ]},
  { section: "Security", items: [
    { href: "/admin/account-recovery",  label: "Account Recovery",  icon: ShieldAlert },
    { href: "/admin/reset-management",  label: "Reset Management",  icon: RefreshCw },
  ]},
  { section: "System", items: [
    { href: "/admin/app-updates", label: "App Updates",        icon: Bell },
    { href: "/admin/admins",       label: "Admin Accounts",     icon: UserCog },
    { href: "/admin/audit-logs",   label: "Audit Logs",         icon: FileText },
    { href: "/admin/settings",     label: "Settings",           icon: Settings },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="admin-sidebar">
      <div className="flex flex-col h-screen" style={{ padding: "14px 12px 16px", position: "sticky", top: 0 }}>
        {/* Brand */}
        <div className="flex items-center gap-2.5" style={{ padding: "6px 8px 14px", borderBottom: "1px dashed var(--hairline)", marginBottom: 10 }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <rect width="30" height="30" rx="8" fill="#1E4CC4"/>
            <text x="15" y="21" textAnchor="middle" fontFamily="system-ui" fontWeight="700" fontSize="16" fill="white">N</text>
          </svg>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>NDPC · Learn</div>
            <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Super Admin</div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {NAV.map(section => (
            <div key={section.section} style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-4)", padding: "4px 10px 6px" }}>
                {section.section}
              </div>
              {section.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} className={`sb-item ${active ? "active" : ""}`}>
                    <Icon size={17} style={{ opacity: 0.85, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px dashed var(--hairline)", paddingTop: 10 }}>
          <Link href="/admin/settings" className="flex items-center gap-2.5 w-full rounded-lg hover:bg-[var(--hover)]" style={{ padding: "8px 8px" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--ndpc-blue), var(--ndpc-blue-2))", color: "white", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11 }}>HO</div>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Harrison Oloye</div>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>super admin</div>
            </div>
            <Settings size={14} style={{ color: "var(--ink-3)" }} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

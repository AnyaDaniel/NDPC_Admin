import { Sidebar } from "@/components/admin/layout/Sidebar";
import { Topbar } from "@/components/admin/layout/Topbar";
import { AuthGate } from "@/components/admin/layout/AuthGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="admin-shell">
        <Sidebar />
        <Topbar />
        <main className="admin-main">{children}</main>
      </div>
    </AuthGate>
  );
}

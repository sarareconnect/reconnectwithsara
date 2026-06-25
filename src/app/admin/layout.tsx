import { requireAdmin } from "@/lib/auth/guards";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { LayoutDashboard } from "lucide-react";

const navItems: NavItem[] = [
  { href: "/admin", label: "Enterprises", icon: "enterprises" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={navItems} brand="Sara Admin" subtitle="Platform owner" />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LayoutDashboard className="h-4 w-4" />
            Super Admin Console
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              {session.name}
            </span>
            <LogoutButton compact className="md:hidden" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

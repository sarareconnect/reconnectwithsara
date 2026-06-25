import { requireEnterprise } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { LayoutDashboard } from "lucide-react";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireEnterprise();
  const enterprise = await prisma.enterprise.findUnique({
    where: { id: session.enterpriseId! },
    select: { name: true },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        items={navItems}
        brand={enterprise?.name ?? "Sara"}
        subtitle="Enterprise manager"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LayoutDashboard className="h-4 w-4" />
            {enterprise?.name ?? "Dashboard"}
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { Building2, LayoutDashboard, Store, type LucideIcon } from "lucide-react";

export type NavIcon = "enterprises" | "overview" | "stores";

const NAV_ICONS: Record<NavIcon, LucideIcon> = {
  enterprises: Building2,
  overview: LayoutDashboard,
  stores: Store,
};

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

interface SidebarProps {
  items: NavItem[];
  brand: string;
  subtitle: string;
}

export function Sidebar({ items, brand, subtitle }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-white md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          S
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">{brand}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = NAV_ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}

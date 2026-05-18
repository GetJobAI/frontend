"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutGrid, Settings } from "lucide-react";
import { cn } from "~/lib/utils";

const navItems = [
  {
    id: "nav-overview",
    href: "/dashboard",
    label: "Overview",
    icon: LayoutGrid,
    exact: true,
  },
  {
    id: "nav-resumes",
    href: "/dashboard/resumes",
    label: "Resumes",
    icon: FileText,
    exact: false,
  },
  {
    id: "nav-settings",
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    exact: false,
  },
];

export function DashboardNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation">
      <ul className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <li key={item.id}>
              <Link
                id={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
                  collapsed
                    ? "mx-auto size-10 justify-center p-0"
                    : "h-10 px-3",
                  isActive
                    ? "bg-violet-600/15 text-violet-300"
                    : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200",
                )}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={cn(isActive ? "text-violet-400" : "opacity-60")}
                >
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                </span>
                {!collapsed && item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

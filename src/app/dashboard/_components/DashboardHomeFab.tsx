"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export function DashboardHomeFab() {
  const pathname = usePathname();
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return null;
  }

  return (
    <Link
      href="/dashboard"
      aria-label="Back to dashboard"
      className="fixed bottom-5 left-5 z-50 inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/90 text-white shadow-[0_0_10px_rgba(255,255,255,0.14)] transition-all hover:scale-105 hover:border-white/25 hover:shadow-[0_0_14px_rgba(255,255,255,0.2)]"
    >
      <Home className="size-4.5" strokeWidth={1.9} />
    </Link>
  );
}

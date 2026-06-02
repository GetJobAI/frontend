"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home } from "lucide-react";

export function DashboardSubpageHeader() {
  const pathname = usePathname();

  // Hide on main dashboard page
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return null;
  }

  // Hide on resume editor page (/dashboard/resumes/[resumeId])
  const parts = pathname.split("/").filter(Boolean);
  if (
    parts.length === 3 &&
    parts[0] === "dashboard" &&
    parts[1] === "resumes" &&
    parts[2] !== "upload" &&
    parts[2] !== "wizard"
  ) {
    return null;
  }

  return (
    <header className="relative z-50 w-full shrink-0 bg-transparent">
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6">
        {/* Left: Rounded Rectangle Home Link */}
        <Link
          href="/dashboard"
          title="Back to dashboard"
          className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-black/40 text-neutral-400 transition-all hover:scale-105 hover:border-white/25 hover:text-white"
        >
          <Home className="size-4.5" strokeWidth={1.8} />
        </Link>

        {/* Right: Rounded Rectangle UserButton with border and no background */}
        <div className="flex size-10 items-center justify-center rounded-xl border border-violet-500/30 hover:border-violet-500/50 transition-all">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-[30px] rounded-lg ring-0",
                userButtonTrigger: "bg-transparent hover:bg-transparent focus:shadow-none focus:outline-none focus:ring-0",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

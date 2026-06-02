import { type ReactNode } from "react";
import { DashboardSubpageHeader } from "~/app/dashboard/_components/DashboardSubpageHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col bg-[#0a0a0a]">
      <main className="app-main-noise relative z-10 flex min-h-0 flex-1 flex-col">
        <DashboardSubpageHeader />
        {children}
      </main>
    </div>
  );
}

"use client";

import { type ReactNode } from "react";
import { DashboardSidebar } from "~/app/dashboard/_components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardSidebar>{children}</DashboardSidebar>;
}

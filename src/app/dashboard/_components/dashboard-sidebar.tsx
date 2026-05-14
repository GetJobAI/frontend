"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { DashboardNav } from "~/app/dashboard/_components/dashboard-nav";
import { Logo } from "~/components/global/Logo";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from "~/components/ui/sidebar";

function DashboardSidebarTrigger() {
  const { setOpen, setOpenMobile } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-30 size-9 border border-white/10 bg-[#111111] text-neutral-300 shadow-lg hover:bg-[#1a1a1a] hover:text-neutral-100 md:hidden"
      onClick={() => {
        setOpen(true);
        setOpenMobile(true);
      }}
      aria-label="Open sidebar"
    >
      <PanelLeftOpen className="size-4" />
    </Button>
  );
}

function DashboardSidebarPanel() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { open, setOpen, setOpenMobile } = useSidebar();
  const isSidebarCollapsed = !open;
  const username =
    user?.username ?? user?.firstName ?? user?.fullName ?? "Profile";

  return (
    <Sidebar
      id="dashboard-sidebar"
      collapsible="icon"
      className="border-r border-white/6 bg-[#0d0d0d]"
    >
      <SidebarHeader
        className={`h-14 flex-row items-center border-b border-white/6 px-3 ${
          isSidebarCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className={isSidebarCollapsed ? "md:hidden" : ""}>
          <Logo size="sm" />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden size-8 cursor-pointer text-neutral-400 hover:text-neutral-100 md:inline-flex"
          onClick={() => setOpen(!open)}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 cursor-pointer text-neutral-400 hover:text-neutral-100 md:hidden"
          onClick={() => setOpenMobile(false)}
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup className="gap-1 p-0">
          <SidebarGroupLabel
            className={`mb-1 px-3 text-[10px] font-semibold tracking-widest text-neutral-600 uppercase ${
              isSidebarCollapsed ? "md:hidden" : ""
            }`}
          >
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <DashboardNav collapsed={isSidebarCollapsed} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/6 px-3 py-3">
        {isSidebarCollapsed ? (
          <div className="flex justify-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-7",
                },
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openUserProfile()}
            className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-white/5"
          >
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={username}
                width={28}
                height={28}
                className="size-7 rounded-full object-cover"
              />
            ) : (
              <div className="size-7 rounded-full bg-white/10" />
            )}
            <p className="truncate text-xs text-neutral-400">{username}</p>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export function DashboardSidebar({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen
      className="min-h-screen bg-[#0a0a0a]"
      style={
        {
          "--sidebar-width": "15rem",
          "--sidebar-width-icon": "5rem",
        } as CSSProperties
      }
    >
      <DashboardSidebarTrigger />
      <DashboardSidebarPanel />
      <div className="flex min-h-screen flex-1 flex-col">
        <main
          id="dashboard-main"
          className="app-main-noise flex flex-1 flex-col p-5 pt-16 pb-16 md:p-16"
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

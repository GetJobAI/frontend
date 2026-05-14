"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { DashboardNav } from "~/app/dashboard/_components/dashboard-nav";
import { ConfirmDialog } from "~/components/global/ConfirmDialog";
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
  const { openUserProfile, signOut } = useClerk();
  const { open, setOpen, setOpenMobile } = useSidebar();
  const isSidebarCollapsed = !open;
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const username =
    user?.username ?? user?.firstName ?? user?.fullName ?? "Profile";

  const footerRowClass =
    "flex items-center gap-3 rounded-md text-sm font-medium text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-200";

  return (
    <>
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
            <Logo size="sm" showMark={false} />
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
          <SidebarGroup className="gap-1.5 p-0">
            <SidebarGroupLabel
              className={`px-3 text-[10px] font-semibold tracking-widest text-neutral-600 uppercase ${
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
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`${footerRowClass} mx-auto size-10 justify-center p-0`}
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "size-7 opacity-60",
                    },
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className={`${footerRowClass} mx-auto size-10 cursor-pointer justify-center p-0`}
                aria-label="Log out"
                title="Log out"
              >
                <span className="opacity-60">
                  <LogOut
                    className="size-4"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => openUserProfile()}
                className={`${footerRowClass} h-10 w-full cursor-pointer px-3 text-left`}
              >
                <span className="shrink-0 opacity-60">
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
                </span>
                <span className="truncate">{username}</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className={`${footerRowClass} h-10 w-full cursor-pointer px-3 text-left`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center opacity-60">
                  <LogOut
                    className="size-4"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>
                <span className="truncate">Log out</span>
              </button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Log out?"
        description="You will need to sign in again to access your account."
        confirmLabel="Log out"
        confirmVariant="default"
        onConfirm={() => void signOut({ redirectUrl: "/sign-in" })}
      />
    </>
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

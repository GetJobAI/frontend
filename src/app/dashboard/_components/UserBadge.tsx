"use client";

import Image from "next/image";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

import { ConfirmDialog } from "~/components/global/ConfirmDialog";

export function UserBadge() {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const username =
    user?.username ?? user?.firstName ?? user?.fullName ?? "Profile";

  return (
    <>
      <div className="card-surface flex shrink-0 items-stretch overflow-hidden rounded-xl">
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="flex cursor-pointer items-center gap-2.5 px-4 py-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/4 hover:text-white"
          aria-label="Open profile"
        >
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={username}
              width={22}
              height={22}
              className="size-[22px] shrink-0 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[9px] font-semibold text-violet-300">
              {username.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden max-w-[5rem] truncate sm:inline sm:max-w-none">
            {username}
          </span>
        </button>

        <div className="w-px shrink-0 self-stretch bg-white/6" />

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="flex shrink-0 cursor-pointer items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-neutral-500 transition-colors hover:bg-white/4 hover:text-neutral-200"
          aria-label="Log out"
        >
          <LogOut className="size-4" strokeWidth={1.7} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You will need to sign in again to access your account."
        confirmLabel="Log out"
        confirmVariant="default"
        onConfirm={() => void signOut({ redirectUrl: "/sign-in" })}
      />
    </>
  );
}

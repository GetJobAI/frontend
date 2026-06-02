"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  Home,
  Target,
  Sliders,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Languages,
  FolderGit2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { EDITOR_TABS, type EditorTabId } from "./editor-tabs";

interface EditorTabStripProps {
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
}

const TAB_ICONS: Record<
  EditorTabId,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  "job-tailoring": Target,
  sections: Sliders,
  personal: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  certifications: Award,
  languages: Languages,
  projects: FolderGit2,
  finish: CheckCircle2,
};

export function EditorTabStrip({
  activeTab,
  onTabChange,
}: EditorTabStripProps) {
  return (
    <div className="shrink-0 overflow-x-auto rounded-xl border border-white/10 bg-black [-webkit-overflow-scrolling:touch]">
      <div className="flex w-max min-w-full divide-x divide-white/10">
        {/* Home Tab */}
        <Link
          href="/dashboard"
          title="Back to dashboard"
          className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center bg-black text-neutral-500 hover:bg-white/8 hover:text-neutral-300 transition-all"
        >
          <Home className="size-5" strokeWidth={1.8} />
        </Link>

        {/* Editor Tabs */}
        {EDITOR_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={cn(
                "flex h-14 min-w-[5.75rem] shrink-0 cursor-pointer flex-col items-center justify-center gap-1 px-2 py-2 transition-all md:w-auto md:min-w-0 md:flex-1",
                isActive
                  ? "bg-violet-500/15 text-violet-300"
                  : "bg-black text-neutral-500 hover:bg-white/8 hover:text-neutral-300",
              )}
            >
              {Icon && <Icon className="size-4" strokeWidth={1.8} />}
              <span className="w-full truncate text-center text-[12px] font-semibold tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* User Profile Tab */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-black" title="User Profile">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-6 ring-1 ring-white/10 hover:ring-white/20 transition-all",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

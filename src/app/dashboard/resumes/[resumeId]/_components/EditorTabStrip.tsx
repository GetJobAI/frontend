"use client";

import { cn } from "~/lib/utils";
import { EDITOR_TABS, type EditorTabId } from "./editor-tabs";

interface EditorTabStripProps {
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
}

export function EditorTabStrip({
  activeTab,
  onTabChange,
}: EditorTabStripProps) {
  return (
    <div className="flex w-full shrink-0 divide-x divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-black">
      {EDITOR_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
            className={cn(
              "flex min-h-11 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center px-1.5 py-3 transition-all",
              isActive
                ? "bg-violet-500/15 text-violet-300"
                : "bg-black text-neutral-500 hover:bg-white/8 hover:text-neutral-300",
            )}
          >
            <span className="w-full truncate text-center text-[11px] font-medium tracking-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

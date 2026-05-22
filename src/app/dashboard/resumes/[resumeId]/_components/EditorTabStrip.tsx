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
    <div className="shrink-0 overflow-x-auto rounded-xl border border-white/10 bg-black [-webkit-overflow-scrolling:touch] md:overflow-hidden">
      <div className="flex w-max min-w-full divide-x divide-white/10 md:w-full">
        {EDITOR_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={cn(
                "flex h-11 w-[5.25rem] shrink-0 cursor-pointer flex-col items-center justify-center px-2 py-3 transition-all md:w-auto md:min-w-0 md:flex-1",
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
    </div>
  );
}

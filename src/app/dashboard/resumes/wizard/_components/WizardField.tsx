"use client";

import { cn } from "~/lib/utils";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {description && <p className="text-xs text-neutral-500">{description}</p>}
    </div>
  );
}

export function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/12 py-2.5 text-xs font-medium text-neutral-500",
        "transition-all hover:border-violet-500/30 hover:text-violet-400",
      )}
    >
      {children}
    </button>
  );
}

export function RemoveButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/10 bg-red-500/5 px-2.5 py-1 text-[11px] font-medium text-red-400/80 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400",
        className,
      )}
      aria-label="Remove"
    >
      <Trash2 className="size-3" strokeWidth={2} />
      Remove
    </button>
  );
}

export function CardRow({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4">
      {children}
    </div>
  );
}

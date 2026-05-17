import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/** Fills remaining space inside padded dashboard `<main>` (resume editor, choose-template, etc.). */
export function DashboardPageFill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 basis-0 flex-col overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

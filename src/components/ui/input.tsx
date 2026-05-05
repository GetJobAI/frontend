import * as React from "react";

import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-neutral-600",
        "focus:border-violet-500/60 focus:bg-white/6 focus:ring-1 focus:ring-violet-500/30 focus:outline-none",
        "transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500/50 aria-invalid:ring-red-500/20",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

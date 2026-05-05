import * as React from "react";

import { cn } from "~/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-neutral-600",
        "focus:border-violet-500/60 focus:bg-white/6 focus:ring-1 focus:ring-violet-500/30 focus:outline-none",
        "min-h-[100px] resize-y leading-relaxed transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500/50 aria-invalid:ring-red-500/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

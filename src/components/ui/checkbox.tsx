"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "~/lib/utils";
import { CheckIcon } from "lucide-react";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-white/20 bg-white/5 transition-colors outline-none group-has-data-disabled:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-violet-500/60 focus-visible:ring-1 focus-visible:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-violet-500 data-[state=checked]:bg-violet-500 data-[state=checked]:text-white",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

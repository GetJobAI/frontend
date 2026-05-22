"use client";

import Image from "next/image";
import { useState } from "react";
import { Layers } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import type { StyleValue, ResumeContent } from "./resume-content-types";

const TEMPLATES: Array<{ value: StyleValue; label: string }> = [
  { value: "professional", label: "Professional" },
  { value: "technical", label: "Technical" },
  { value: "minimal", label: "Minimal" },
];

interface TemplatesPopoverProps {
  content: ResumeContent;
  onStyleChange: (style: StyleValue) => void;
}

export function TemplatesPopover({
  content,
  onStyleChange,
}: TemplatesPopoverProps) {
  const [open, setOpen] = useState(false);
  const current = content.style ?? "professional";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-all hover:border-violet-500/30 hover:bg-violet-500/8 hover:text-violet-300"
        >
          <Layers className="size-3.5" strokeWidth={1.7} />
          Templates
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 border-white/10 bg-neutral-950 p-3 shadow-2xl"
        align="end"
        sideOffset={8}
      >
        <p className="mb-2 text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
          Style
        </p>
        <div className="flex flex-col gap-1">
          {TEMPLATES.map((tpl) => {
            const isActive = current === tpl.value;
            return (
              <button
                key={tpl.value}
                type="button"
                onClick={() => {
                  onStyleChange(tpl.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                  isActive
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                    : "border-transparent text-neutral-300 hover:border-white/8 hover:bg-white/4",
                )}
              >
                <TemplateMiniPreview style={tpl.value} />
                <span className="font-medium">{tpl.label}</span>
                {isActive && (
                  <span className="ml-auto text-[10px] text-violet-400">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TemplateMiniPreview({ style }: { style: StyleValue }) {
  const previewSrc =
    style === "technical"
      ? "/resume-templates/technical.webp"
      : style === "minimal"
        ? "/resume-templates/minimal.webp"
        : "/resume-templates/professional.webp";

  return (
    <div className="h-9 w-7 shrink-0 overflow-hidden rounded border border-white/15 bg-neutral-900">
      <Image
        src={previewSrc}
        alt={`${style} template preview`}
        width={863}
        height={1222}
        className="h-full w-full object-cover object-top"
        sizes="28px"
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { updateResumeContentAction } from "~/server/actions/resume/actions";

type StyleValue = "professional" | "technical" | "minimal";

const TEMPLATES: Array<{
  value: StyleValue;
  label: string;
  description: string;
  preview: React.ReactNode;
}> = [
  {
    value: "professional",
    label: "Professional",
    description: "Clean layout, ATS-friendly, strong typographic hierarchy",
    preview: <ProfessionalPreview />,
  },
  {
    value: "technical",
    label: "Technical",
    description: "Dense, skills-forward, optimised for engineering roles",
    preview: <TechnicalPreview />,
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Whitespace-driven, elegant, lets content breathe",
    preview: <MinimalPreview />,
  },
];

interface ChooseTemplateClientProps {
  resumeId: string;
  currentStyle: StyleValue;
  initialContent: Record<string, unknown>;
}

export function ChooseTemplateClient({
  resumeId,
  currentStyle,
  initialContent,
}: ChooseTemplateClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<StyleValue>(currentStyle);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (style: StyleValue) => {
    setSelected(style);
  };

  const handleContinue = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateResumeContentAction(resumeId, {
        ...initialContent,
        style: selected,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/resumes/${resumeId}`);
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="card-surface flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8">
          <div className="m-auto w-full max-w-5xl">
            <div className="mb-8 text-center">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-violet-400 uppercase">
                Almost there
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Choose your template
              </h1>
              <p className="mt-3 text-sm text-neutral-500">
                Pick the layout that best fits how you want to present yourself.
                You&apos;ll be able to change it later.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              {TEMPLATES.map((tpl) => {
                const isActive = selected === tpl.value;
                return (
                  <button
                    key={tpl.value}
                    type="button"
                    onClick={() => handleSelect(tpl.value)}
                    className={cn(
                      "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200",
                      isActive
                        ? "border-violet-500 shadow-[0_0_0_1px_rgba(139,92,246,0.4),0_0_40px_rgba(139,92,246,0.15)]"
                        : "border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/4",
                    )}
                  >
                    {isActive && (
                      <span className="absolute top-3 right-3 z-10 flex size-5 items-center justify-center rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]">
                        <svg
                          className="size-3 text-white"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}

                    <div
                      className={cn(
                        "flex h-72 w-full items-start justify-center overflow-hidden p-6 transition-colors",
                        isActive ? "bg-violet-950/20" : "bg-white/1",
                      )}
                    >
                      <div className="w-full max-w-[200px] origin-top scale-[0.72] transform">
                        {tpl.preview}
                      </div>
                    </div>

                    <div className="border-t border-white/6 p-5">
                      <p
                        className={cn(
                          "text-sm font-semibold transition-colors",
                          isActive ? "text-violet-300" : "text-white",
                        )}
                      >
                        {tpl.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="mt-6 text-center text-xs text-red-400">{error}</p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/6 px-6 py-4 sm:px-8">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleContinue}
              disabled={isPending}
              className="cursor-pointer rounded-xl bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] transition-all hover:bg-violet-500 hover:shadow-[0_0_32px_rgba(139,92,246,0.5)] disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Continue to editor →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewLine({
  width,
  height = "h-1.5",
  className,
}: {
  width: string;
  height?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-sm bg-current", height, width, className)} />
  );
}

function ProfessionalPreview() {
  return (
    <div className="w-full rounded-md border border-white/10 bg-neutral-900 p-4 text-neutral-400 shadow-lg">
      <div className="mb-3 border-b border-white/10 pb-3">
        <div className="mb-1.5 h-3 w-3/4 rounded bg-white/80" />
        <div className="flex gap-2">
          <PreviewLine width="w-1/3" />
          <PreviewLine width="w-1/4" />
        </div>
      </div>
      <div className="mb-3">
        <PreviewLine width="w-1/4" height="h-1" className="mb-1.5 opacity-60" />
        <PreviewLine width="w-full" />
        <PreviewLine width="w-5/6" className="mt-1" />
        <PreviewLine width="w-4/5" className="mt-1" />
      </div>
      <div className="mb-3">
        <PreviewLine width="w-1/4" height="h-1" className="mb-1.5 opacity-60" />
        <div className="flex items-start justify-between gap-2">
          <PreviewLine width="w-1/3" />
          <PreviewLine width="w-1/4" />
        </div>
        <PreviewLine width="w-full" className="mt-1" />
        <PreviewLine width="w-4/5" className="mt-1" />
      </div>
      <div>
        <PreviewLine width="w-1/4" height="h-1" className="mb-1.5 opacity-60" />
        <div className="flex flex-wrap gap-1">
          {[..."●●●●●●"].map((_, i) => (
            <div key={i} className="h-1.5 w-8 rounded-full bg-current" />
          ))}
        </div>
      </div>
    </div>
  );
}

function TechnicalPreview() {
  return (
    <div className="w-full rounded-md border border-white/10 bg-neutral-900 text-neutral-400 shadow-lg">
      <div className="border-b border-violet-500/30 bg-violet-950/30 p-4">
        <div className="mb-1.5 h-3 w-2/3 rounded bg-white/80" />
        <div className="flex gap-2">
          <PreviewLine width="w-1/4" />
          <PreviewLine width="w-1/4" />
          <PreviewLine width="w-1/4" />
        </div>
      </div>
      <div className="flex">
        <div className="w-2/5 border-r border-white/8 bg-white/2 p-3">
          <PreviewLine width="w-3/4" height="h-1" className="mb-2 opacity-50" />
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded border border-white/15 px-1 py-0.5 text-[5px]"
              >
                ▪
              </div>
            ))}
          </div>
          <PreviewLine
            width="w-3/4"
            height="h-1"
            className="mt-3 mb-2 opacity-50"
          />
          <PreviewLine width="w-full" className="mt-1" />
          <PreviewLine width="w-4/5" className="mt-1" />
        </div>
        <div className="flex-1 p-3">
          <PreviewLine
            width="w-3/4"
            height="h-1"
            className="mb-1.5 opacity-50"
          />
          <PreviewLine width="w-full" />
          <PreviewLine width="w-full" className="mt-1" />
          <PreviewLine width="w-3/4" className="mt-1" />
          <PreviewLine
            width="w-3/4"
            height="h-1"
            className="mt-3 mb-1.5 opacity-50"
          />
          <PreviewLine width="w-full" />
          <PreviewLine width="w-4/5" className="mt-1" />
        </div>
      </div>
    </div>
  );
}

function MinimalPreview() {
  return (
    <div className="w-full rounded-md border border-white/10 bg-white/[0.03] p-5 text-neutral-400 shadow-lg">
      <div className="mb-5">
        <div className="mb-1 h-4 w-1/2 rounded bg-white/70" />
        <PreviewLine width="w-1/3" />
      </div>
      <div className="mb-4 space-y-1.5">
        <PreviewLine width="w-full" />
        <PreviewLine width="w-11/12" />
        <PreviewLine width="w-4/5" />
      </div>
      <div className="mb-3 border-t border-white/6 pt-3">
        <PreviewLine width="w-1/5" height="h-1" className="mb-2 opacity-40" />
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <PreviewLine width="w-3/4" />
            <PreviewLine width="w-full" className="mt-1" />
          </div>
          <PreviewLine width="w-1/5" className="opacity-50" />
        </div>
      </div>
      <div className="border-t border-white/6 pt-3">
        <PreviewLine width="w-1/5" height="h-1" className="mb-2 opacity-40" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {[1, 2, 3].map((i) => (
            <PreviewLine key={i} width="w-12" />
          ))}
        </div>
      </div>
    </div>
  );
}

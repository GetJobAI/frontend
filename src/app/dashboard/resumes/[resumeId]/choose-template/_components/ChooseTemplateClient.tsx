"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { updateResumeContentAction } from "~/server/actions/resume/actions";

type StyleValue = "professional" | "technical" | "minimal";

const TEMPLATES: Array<{
  value: StyleValue;
  label: string;
  description: string;
  previewSrc: string;
}> = [
  {
    value: "professional",
    label: "Professional",
    description: "Clean layout, ATS-friendly, strong typographic hierarchy",
    previewSrc: "/resume-templates/professional.webp",
  },
  {
    value: "technical",
    label: "Technical",
    description: "Dense, skills-forward, optimised for engineering roles",
    previewSrc: "/resume-templates/technical.webp",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Whitespace-driven, elegant, lets content breathe",
    previewSrc: "/resume-templates/minimal.webp",
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
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
                      "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-black text-left transition-all duration-200",
                      isActive
                        ? "border-violet-500 shadow-[0_0_0_1px_rgba(139,92,246,0.4),0_0_40px_rgba(139,92,246,0.15)]"
                        : "border-white/8 hover:border-white/16 hover:bg-black",
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
                      <div className="w-full max-w-[220px] overflow-hidden rounded-md border border-white/10 shadow-lg">
                        <Image
                          src={tpl.previewSrc}
                          alt={`${tpl.label} resume template preview`}
                          width={863}
                          height={1222}
                          className="h-auto w-full"
                          sizes="(min-width: 640px) 220px, 70vw"
                        />
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

            <div className="mt-16 flex justify-center">
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
    </div>
  );
}

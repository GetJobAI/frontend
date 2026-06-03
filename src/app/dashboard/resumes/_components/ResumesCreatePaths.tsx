import Link from "next/link";
import { ArrowRight, Upload, WandSparkles } from "lucide-react";
import type { ComponentType } from "react";

import { LinkedInIcon } from "~/components/global/LinkedInIcon";

const createPaths: Array<{
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  comingSoon?: boolean;
}> = [
  {
    href: "/dashboard/resumes/upload",
    title: "Upload Resume",
    description: "Upload PDF or DOCX and parse automatically",
    icon: Upload,
  },
  {
    href: "/dashboard/resumes/wizard",
    title: "Wizard Builder",
    description: "Build from scratch in guided 9 steps",
    icon: WandSparkles,
  },
  {
    href: "/dashboard/resumes/linkedin",
    title: "LinkedIn Import",
    description: "Import your LinkedIn ZIP export",
    icon: ({ className }) => (
      <LinkedInIcon className={className} strokeWidth={1.7} />
    ),
    comingSoon: true,
  },
];

interface ResumesCreatePathsProps {
  hasUnfinishedWizardSession?: boolean;
}

export function ResumesCreatePaths({
  hasUnfinishedWizardSession = false,
}: ResumesCreatePathsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {createPaths.map((path) => {
        const Icon = path.icon;
        const showUnfinishedBadge =
          hasUnfinishedWizardSession &&
          path.href === "/dashboard/resumes/wizard";

        const cardContent = (
          <>
            {showUnfinishedBadge ? (
              <div className="pointer-events-none absolute -top-11 left-1/2 z-20 -translate-x-1/2 rounded-md border border-orange-300/30 bg-black/95 px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap text-orange-200 opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                You have an unfinished wizard session
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-lg bg-violet-500/15 p-2 text-violet-400">
                <Icon className="size-4" />
              </span>
              {!path.comingSoon && (
                <ArrowRight className="size-4 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-violet-400" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="relative flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{path.title}</p>
                {path.comingSoon && (
                  <span className="rounded-full border border-neutral-700 bg-neutral-800/50 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-400">
                    soon
                  </span>
                )}
                {showUnfinishedBadge ? (
                  <span
                    aria-hidden="true"
                    className="size-2.5 animate-pulse rounded-full border border-orange-300/60 bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.65)]"
                  />
                ) : null}
              </div>
              <p className="text-xs text-neutral-500">{path.description}</p>
            </div>
          </>
        );

        if (path.comingSoon) {
          return (
            <div
              key={path.href}
              className="card-surface pointer-events-none relative flex min-h-[132px] cursor-default flex-col justify-between p-4 opacity-50 select-none"
            >
              {cardContent}
            </div>
          );
        }

        return (
          <Link
            key={path.href}
            href={path.href}
            className="group card-surface card-surface-hover relative flex min-h-[132px] flex-col justify-between p-4"
          >
            {cardContent}
          </Link>
        );
      })}
    </div>
  );
}

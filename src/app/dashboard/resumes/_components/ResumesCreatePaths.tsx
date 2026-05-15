import Link from "next/link";
import { ArrowRight, Upload, WandSparkles } from "lucide-react";
import type { ComponentType } from "react";

import { LinkedInIcon } from "~/components/global/LinkedInIcon";

const createPaths: Array<{
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
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
  },
];

export function ResumesCreatePaths() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {createPaths.map((path) => {
        const Icon = path.icon;
        return (
          <Link
            key={path.href}
            href={path.href}
            className="group card-surface card-surface-hover flex min-h-[132px] flex-col justify-between p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-lg bg-violet-500/15 p-2 text-violet-400">
                <Icon className="size-4" />
              </span>
              <ArrowRight className="size-4 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-violet-400" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-white">{path.title}</p>
              <p className="text-xs text-neutral-500">{path.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

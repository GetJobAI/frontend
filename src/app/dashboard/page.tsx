import { currentUser } from "@clerk/nextjs/server";
import {
  Activity,
  ArrowRight,
  Briefcase,
  FileText,
  ShieldCheck,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { LinkedInIcon } from "~/components/global/LinkedInIcon";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await currentUser();

  const firstName =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "there";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      id: "stat-resumes",
      label: "Resumes",
      value: 0,
      icon: (
        <FileText className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      ),
    },
    {
      id: "stat-optimizations",
      label: "Optimizations",
      value: 0,
      icon: (
        <Activity className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      ),
    },
    {
      id: "stat-ats",
      label: "Avg ATS Score",
      value: "—",
      icon: (
        <ShieldCheck
          className="size-3.5"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      ),
    },
    {
      id: "stat-applications",
      label: "Applications",
      value: 0,
      icon: (
        <Briefcase className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      ),
    },
  ];

  const resumePaths = [
    {
      id: "path-upload",
      href: "/dashboard/resumes/upload",
      title: "Upload PDF or DOCX",
      description:
        "Parse an existing resume with Poppler + spaCy NLP. Extracts experience, skills, and education automatically — up to 10 MB.",
      icon: (
        <Upload className="size-[18px]" strokeWidth={1.7} aria-hidden="true" />
      ),
    },
    {
      id: "path-wizard",
      href: "/dashboard/resumes/wizard",
      title: "9-Step Wizard Builder",
      description:
        "Build from scratch with AI drafting and XYZ achievement coaching. Progress auto-saves every 500 ms — pick up right where you left off.",
      icon: (
        <WandSparkles
          className="size-[18px]"
          strokeWidth={1.7}
          aria-hidden="true"
        />
      ),
    },
    {
      id: "path-linkedin",
      href: "/dashboard/resumes/linkedin",
      title: "LinkedIn ZIP Import",
      description:
        "Export your LinkedIn data and drop in the ZIP — we extract Positions, Education, Skills, and Certifications to pre-fill the wizard instantly.",
      icon: (
        <LinkedInIcon
          width="18"
          height="18"
          strokeWidth={1.7}
          aria-hidden="true"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-medium tracking-widest text-neutral-600 uppercase">
            {today}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Hey, {firstName}
          </h1>
        </div>
        <p className="pb-0.5 text-[11px] font-medium tracking-widest text-neutral-700 uppercase">
          Build · Optimize · Apply
        </p>
      </div>
      <div
        aria-label="Overview"
        className="grid grid-cols-1 divide-y divide-white/6 overflow-hidden rounded-xl border border-white/6 bg-[#0d0d0d] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <div key={stat.id} className="flex items-center gap-3.5 px-5 py-4">
            <span className="shrink-0 text-violet-400/60">{stat.icon}</span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-lg leading-none font-semibold text-white tabular-nums">
                {stat.value}
              </span>
              <span className="truncate text-[10px] font-medium text-neutral-600">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
        <section
          aria-labelledby="create-heading"
          className="card-surface col-span-1 flex min-h-0 flex-col lg:col-span-3"
        >
          <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
            <h2
              id="create-heading"
              className="text-sm font-semibold text-white"
            >
              Create a resume
            </h2>
            <span className="text-[10px] font-medium tracking-wider text-neutral-600 uppercase">
              Choose a path
            </span>
          </div>
          <div className="flex flex-1 flex-col divide-y divide-white/5">
            {resumePaths.map((path, i) => (
              <Link
                key={path.id}
                id={path.id}
                href={path.href}
                className="group relative flex min-h-0 flex-1 items-center gap-5 px-6 py-4 transition-all duration-300 hover:bg-white/2"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-3 left-0 w-px bg-violet-500/0 transition-colors duration-300 group-hover:bg-violet-500/60"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-radial-[70%_100%_at_0%_50%] from-violet-600/12 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="relative z-10 w-7 shrink-0 text-right text-2xl font-bold text-white/10 tabular-nums transition-colors select-none group-hover:text-violet-400/35"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400 transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-600/20 group-hover:shadow-[0_0_24px_rgba(124,58,237,0.28)]">
                  {path.icon}
                </span>
                <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-sm font-semibold text-white transition-colors group-hover:text-violet-100">
                    {path.title}
                  </p>
                  <p className="text-xs leading-relaxed text-neutral-500 transition-colors group-hover:text-neutral-400">
                    {path.description}
                  </p>
                </div>
                <span className="relative z-10 shrink-0 text-neutral-700 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-400">
                  <ArrowRight
                    className="size-3.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <div className="col-span-1 flex min-h-0 flex-col gap-4 lg:col-span-2">
          <Link
            id="optimize-card"
            href="/dashboard/resumes"
            className="card-surface card-surface-hover group relative flex flex-col gap-4 overflow-hidden p-5"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-violet-600/12 blur-3xl"
            />
            <div className="flex items-start justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-violet-600/12 text-violet-400">
                <Zap className="size-4" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
                Next step
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-white">
                Optimize for a job
              </h3>
              <p className="text-xs leading-relaxed text-neutral-500">
                Paste a job description and let AI rewrite your resume to beat
                the ATS filter.
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-violet-400 opacity-0 transition-opacity group-hover:opacity-100">
              Get started{" "}
              <ArrowRight
                className="size-3.5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>
          </Link>
          <div className="card-surface flex flex-1 flex-col gap-5 p-5">
            <p className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
              How it works
            </p>
            <ol className="flex flex-1 flex-col">
              {[
                {
                  n: "1",
                  label: "Create or upload your resume",
                  sub: "Choose a path on the left to get started",
                },
                {
                  n: "2",
                  label: "Optimize for a job posting",
                  sub: "Paste a job description — AI rewrites your resume to pass ATS",
                },
                {
                  n: "3",
                  label: "Download the tailored PDF",
                  sub: "Export a polished, job-specific resume in one click",
                },
              ].map((step, i, arr) => (
                <li key={step.n} className="flex flex-1 gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-[9px] font-bold text-violet-400">
                      {step.n}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="mt-1.5 w-px flex-1 bg-linear-to-b from-violet-500/20 to-transparent" />
                    )}
                  </div>
                  <div
                    className={`flex flex-col gap-0.5 pb-5 ${i === arr.length - 1 ? "pb-0" : ""}`}
                  >
                    <p className="text-xs leading-snug font-medium text-neutral-300">
                      {step.label}
                    </p>
                    <p className="text-[11px] leading-relaxed text-neutral-600">
                      {step.sub}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

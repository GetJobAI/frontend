import { ArrowRight, ShieldCheck, WandSparkles } from "lucide-react";
import Link from "next/link";
import { type Metadata } from "next";
import { Logo } from "~/components/logo";

export const metadata: Metadata = {
  title: "GetJobAI — AI-Powered Resume Optimization",
  description:
    "Beat ATS filters and land more interviews. AI resume rewriting, ATS scoring, and LinkedIn import — in under 60 seconds.",
};

const features = [
  {
    id: "ats-optimization",
    icon: (
      <ShieldCheck className="size-5" strokeWidth={1.6} aria-hidden="true" />
    ),
    title: "ATS Optimization",
    description:
      "Score your resume against any job description with TF-IDF keyword analysis. Get a detailed gap report and boost your ATS compatibility score by 35+ points.",
  },
  {
    id: "ai-rewriting",
    icon: (
      <WandSparkles className="size-5" strokeWidth={1.6} aria-hidden="true" />
    ),
    title: "AI Resume Rewriting",
    description:
      "GPT-4o rewrites your bullet points using the XYZ achievement method — naturally integrating keywords without fabricating experience.",
  },
  {
    id: "linkedin-import",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    title: "LinkedIn ZIP Import",
    description:
      "Upload your LinkedIn data export and auto-populate every resume field in one click. No re-typing your work history ever again.",
  },
];

export default function HomePage() {
  return (
    <div className="landing-bg-base relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="landing-bg-grid pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="landing-bg-noise pointer-events-none absolute inset-0 opacity-50"
      />
      <header className="relative z-10 flex h-14 items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            id="nav-sign-in"
            href="/sign-in?redirect_url=%2Fdashboard"
            className="rounded-md px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            id="nav-sign-up"
            href="/sign-up?redirect_url=%2Fdashboard"
            className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Get started
          </Link>
        </nav>
      </header>
      <main className="relative z-10">
        <section
          id="hero"
          className="flex flex-col items-center px-6 pt-20 pb-24 text-center"
        >
          <h1 className="mx-auto max-w-3xl text-5xl leading-[1.1] font-semibold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl">
            Get past ATS.{" "}
            <span className="text-violet-400">Land the interview.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base text-balance text-neutral-400 sm:text-lg">
            AI-powered resume optimization that rewrites your CV for any job
            description — in under 60 seconds. Upload, build from scratch, or
            import from LinkedIn.
          </p>
          <div
            id="hero-ctas"
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              id="cta-sign-up"
              href="/sign-up?redirect_url=%2Fdashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all hover:bg-violet-500 hover:shadow-violet-800/50"
            >
              Start for free
              <ArrowRight
                className="size-4"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
            <Link
              id="cta-sign-in"
              href="/sign-in?redirect_url=%2Fdashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-8 text-xs text-neutral-600">
            No credit card required · GDPR compliant · Cancel anytime
          </p>
        </section>
        <section
          id="features"
          aria-labelledby="features-heading"
          className="mx-auto max-w-5xl px-6 pb-24"
        >
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-medium tracking-widest text-violet-400 uppercase">
              Core capabilities
            </p>
            <h2
              id="features-heading"
              className="text-2xl font-semibold text-white"
            >
              Everything you need to get hired
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                id={`feature-${feature.id}`}
                className="card-surface card-surface-hover flex flex-col gap-4 p-6"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-600/15 text-violet-400">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section
          id="stats"
          aria-label="Platform statistics"
          className="border-t border-white/6 py-10"
        >
          <div className="mx-auto grid max-w-3xl grid-cols-3 divide-x divide-white/6 text-center">
            {[
              { value: "35+", label: "ATS points gained on avg" },
              { value: "60s", label: "Average optimization time" },
              { value: "3", label: "Resume input paths" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 px-6 py-4">
                <span className="text-2xl font-semibold text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-neutral-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

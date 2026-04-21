import { CircleAlert } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 text-center">
      <div
        aria-hidden="true"
        className="gradient-violet-subtle pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-60"
      />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <span className="mb-8 text-[120px] leading-none font-bold tracking-tighter text-white/10 select-none">
          404
        </span>
        <div className="-mt-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl border border-white/8 bg-[#111]">
            <CircleAlert
              className="size-[22px] text-violet-400"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </div>

          <h1 className="text-xl font-semibold text-white">Page not found</h1>
          <p className="max-w-sm text-sm text-neutral-500">
            This page doesn&apos;t exist yet — it may be under active
            development. Head back to the dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            id="not-found-back"
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Go to dashboard
          </Link>
          <Link
            id="not-found-home"
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/10"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

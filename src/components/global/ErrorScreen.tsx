"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

interface ErrorScreenProps {
  error: Error & { digest?: string };
  reset: () => void;
  idPrefix?: "error" | "global-error";
}

export function ErrorScreen({
  error,
  reset,
  idPrefix = "error",
}: ErrorScreenProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 text-center">
      <div
        aria-hidden="true"
        className="gradient-red-subtle pointer-events-none absolute inset-x-0 top-0 h-[700px] opacity-60"
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <span className="mb-8 text-[120px] leading-none font-bold tracking-tighter text-white/10 select-none">
          500
        </span>

        <div className="-mt-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl border border-white/8 bg-[#111]">
            <TriangleAlert
              className="size-[22px] text-red-400"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </div>

          <h2 className="text-xl font-semibold text-white">Error</h2>
          <p className="max-w-sm text-sm text-neutral-500">
            Something went very wrong. Please retry or go back to the dashboard.
          </p>
          {error.digest && (
            <p className="font-mono text-[11px] text-neutral-600">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            id={`${idPrefix}-retry`}
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
          >
            Try again
          </button>
          <Link
            id={`${idPrefix}-dashboard`}
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/10"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

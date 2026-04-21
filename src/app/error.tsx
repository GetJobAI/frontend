"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
        <TriangleAlert
          className="size-[22px] text-red-400"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">
          Something went wrong
        </h2>
        <p className="max-w-sm text-sm text-neutral-500">
          An unexpected error occurred. Please try again or return to the
          dashboard.
        </p>
        {error.digest && (
          <p className="font-mono text-[11px] text-neutral-600">
            Digest: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          id="error-retry"
          onClick={reset}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
        >
          Try again
        </button>
        <Link
          id="error-home"
          href="/dashboard"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/10"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

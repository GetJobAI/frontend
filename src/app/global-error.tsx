"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function GlobalError({
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
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-6 text-center font-sans">
        <div className="flex size-14 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
          <TriangleAlert
            className="size-6 text-red-400"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </div>

        <div style={{ color: "white", fontFamily: "system-ui, sans-serif" }}>
          <h1
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Critical error
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#737373", maxWidth: 360 }}>
            Something went very wrong. Please reload the page.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.7rem",
                fontFamily: "monospace",
                color: "#525252",
                marginTop: "0.5rem",
              }}
            >
              Digest: {error.digest}
            </p>
          )}
        </div>

        <button
          id="global-error-reset"
          onClick={reset}
          style={{
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}

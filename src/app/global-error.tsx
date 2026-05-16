"use client";

import { ErrorScreen } from "~/components/global/ErrorScreen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ErrorScreen error={error} reset={reset} idPrefix="global-error" />
      </body>
    </html>
  );
}

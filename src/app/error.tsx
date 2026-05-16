"use client";

import { ErrorScreen } from "~/components/global/ErrorScreen";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorScreen error={error} reset={reset} idPrefix="error" />;
}

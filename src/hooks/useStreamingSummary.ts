"use client";

import { useState } from "react";

export function useStreamingSummary(_sessionId: string) {
  const [draft] = useState("");
  const [streaming] = useState(false);

  return { draft, streaming, generateSummary: null };
}

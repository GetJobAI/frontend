import {
  getApiOptimisationsOptimisationIdCoverLetter,
  postApiOptimisationsOptimisationIdCoverLetterGenerate,
} from "~/server/api/generated/optimizer/optimizer";
import { getOptimizations } from "~/server/api/generated/optimizations/optimizations";
import type { Optimizations } from "~/server/api/generated/schemas/optimizations";

import { testHttpOptions } from "./constants";

export function extractLatestOptimization(rows: unknown): Optimizations | null {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  const first: unknown = rows[0];
  if (!first || typeof first !== "object" || !("id" in first)) {
    return null;
  }
  const id = (first as Optimizations).id;
  return typeof id === "string" && id.length > 0 ? (first as Optimizations) : null;
}

export async function fetchLatestOptimizationForResume(
  resumeId: string,
): Promise<Optimizations | null> {
  const rows = await getOptimizations(
    {
      resume_id: `eq.${resumeId}`,
      order: "created_at.desc",
      limit: "1",
    },
    testHttpOptions,
  );
  return extractLatestOptimization(rows);
}

export async function runCoverLetterGenerate(
  optimisationId: string,
  addStep: (name: string, data?: unknown) => void,
): Promise<{ coverLetterPreview: string }> {
  const generated =
    await postApiOptimisationsOptimisationIdCoverLetterGenerate(
      optimisationId,
      {},
      testHttpOptions,
    );
  addStep("optimizer.cover_letter.generate", {
    wordCount: generated.wordCount,
    salutationUsed: generated.salutationUsed,
  });

  const saved = await getApiOptimisationsOptimisationIdCoverLetter(
    optimisationId,
    testHttpOptions,
  );
  addStep("optimizer.cover_letter.get", {
    wordCount: saved.wordCount,
  });

  const preview =
    saved.coverLetter.length > 200
      ? `${saved.coverLetter.slice(0, 200)}…`
      : saved.coverLetter;

  return { coverLetterPreview: preview };
}

"use server";

import { getUserId } from "~/lib/auth";
import { getResumeAction } from "~/server/actions/resume/actions";
import {
  createRequestLog,
  serializeAxiosError,
} from "~/server/lib/request-log";
import {
  fetchLatestOptimizationForResume,
  runCoverLetterGenerate,
} from "./cover-letter-shared";
import { getApiOptimisationsOptimisationIdCoverLetter } from "~/server/api/generated/optimizer/optimizer";
import { testHttpOptions } from "./constants";
import { classifyRequestError } from "./errors";
import type { OptimizerFailureKind } from "./errors";

export type TestCoverLetterResult =
  | {
      ok: true;
      outcome: "cover_letter_generated";
      optimisationId: string;
      coverLetterPreview: string;
      coverLetterText?: string;
      logPath?: string | null;
    }
  | {
      ok: true;
      outcome: "no_optimisation_in_db";
      message: string;
      logPath?: string | null;
    }
  | {
      ok: false;
      kind: OptimizerFailureKind;
      error: string;
      logPath?: string | null;
    };

/** Cover-letter API only: verifies DB row exists, then calls optimizer (no env overrides). */
export async function testCoverLetterAction(
  resumeId: string,
): Promise<TestCoverLetterResult> {
  const { addStep, finish } = createRequestLog("cover-letter-test");
  let result: TestCoverLetterResult = {
    ok: false,
    kind: "unknown",
    error: "Cover letter test did not run.",
  };

  try {
    const userId = await getUserId();
    addStep("action.start", { userId, resumeId });

    const resume = await getResumeAction(resumeId);
    if (!resume) {
      result = {
        ok: false,
        kind: "resume_not_found",
        error: "Resume not found for current user.",
      };
      addStep("resume.missing", result);
    } else {
      addStep("resume.found", { resumeId: resume.id });

      const optimization = await fetchLatestOptimizationForResume(resumeId);
      addStep("optimisation.lookup", {
        found: Boolean(optimization),
        optimizationId: optimization?.id ?? null,
      });

      if (!optimization) {
        result = {
          ok: true,
          outcome: "no_optimisation_in_db",
          message:
            "No row in optimizations for this resume — optimizer API was not called (expected for cover-letter-only test without pipeline).",
        };
        addStep("optimisation.missing_expected", result);
      } else {
        try {
          const { coverLetterPreview } = await runCoverLetterGenerate(
            optimization.id,
            addStep,
          );
          const savedCoverLetter = await getApiOptimisationsOptimisationIdCoverLetter(
            optimization.id,
            testHttpOptions,
          ).catch(() => null);

          result = {
            ok: true,
            outcome: "cover_letter_generated",
            optimisationId: optimization.id,
            coverLetterPreview,
            coverLetterText: savedCoverLetter?.coverLetter,
          };
          addStep("action.success", {
            ok: true,
            outcome: "cover_letter_generated",
            optimisationId: optimization.id,
            coverLetterPreview,
          });
        } catch (error) {
          const classified = classifyRequestError(error);
          result = {
            ok: false,
            kind: classified.kind,
            error: classified.message,
          };
          addStep("optimizer.cover_letter.error", {
            ...classified,
            axios: serializeAxiosError(error),
          });
        }
      }
    }
  } catch (e) {
    const classified = classifyRequestError(e);
    console.error("[testCoverLetterAction]", e);
    result = {
      ok: false,
      kind: classified.kind,
      error: classified.message,
    };
    addStep("action.error", {
      ...classified,
      axios: serializeAxiosError(e),
    });
  } finally {
    const logPath = await finish(result);
    if (logPath) {
      result = { ...result, logPath };
      console.info(`[cover-letter-test] log written: ${logPath}`);
    }
  }

  return result;
}

"use server";

import { getUserId } from "~/lib/auth";
import { coreMutator } from "~/server/api/core-mutator";
import { postJobPostings } from "~/server/api/generated/job-postings/job-postings";
import { getOptimizations } from "~/server/api/generated/optimizations/optimizations";
import type { JobPostings } from "~/server/api/generated/schemas";
import type { Optimizations } from "~/server/api/generated/schemas/optimizations";
import { getResumeAction } from "~/server/actions/resume/actions";
import {
  createRequestLog,
  serializeAxiosError,
} from "~/server/lib/request-log";
import {
  extractLatestOptimization,
  fetchLatestOptimizationForResume,
  runCoverLetterGenerate,
} from "./cover-letter-shared";
import { ARTIFICIAL_JOB_POSTING_CONTENT } from "./fixtures";
import {
  PIPELINE_POLL_TIMEOUT_MS,
  testHttpOptions,
} from "./constants";
import { classifyRequestError } from "./errors";
import type { OptimizerFailureKind } from "./errors";

const POLL_INITIAL_DELAY_MS = 500;
const POLL_MAX_DELAY_MS = 1_500;

export type TestOptimizerResult =
  | {
      ok: true;
      optimisationId: string;
      coverLetterPreview?: string;
      logPath?: string | null;
    }
  | {
      ok: false;
      kind: OptimizerFailureKind;
      error: string;
      logPath?: string | null;
    };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJobPostingId(data: unknown): string | null {
  if (Array.isArray(data) && data.length > 0) {
    const first: unknown = data[0];
    if (first && typeof first === "object" && "id" in first) {
      const id = (first as JobPostings).id;
      return typeof id === "string" && id.length > 0 ? id : null;
    }
  }
  if (data && typeof data === "object" && "id" in data) {
    const id = (data as JobPostings).id;
    return typeof id === "string" && id.length > 0 ? id : null;
  }
  return null;
}

async function pollForOptimization(
  resumeId: string,
  addStep: (name: string, data?: unknown) => void,
): Promise<Optimizations | null> {
  const deadline = Date.now() + PIPELINE_POLL_TIMEOUT_MS;
  let delayMs = POLL_INITIAL_DELAY_MS;
  let attempt = 0;

  while (Date.now() < deadline) {
    attempt += 1;
    const rows = await getOptimizations(
      {
        resume_id: `eq.${resumeId}`,
        order: "created_at.desc",
        limit: "1",
      },
      testHttpOptions,
    );
    const row = extractLatestOptimization(rows);
    addStep("poll.optimizations", {
      attempt,
      found: Boolean(row),
      optimizationId: row?.id ?? null,
      jobPostingId: row?.job_posting_id ?? null,
      atsScoreId: row?.ats_score_id ?? null,
    });
    if (row) {
      return row;
    }
    await sleep(delayMs);
    delayMs = Math.min(Math.round(delayMs * 1.25), POLL_MAX_DELAY_MS);
  }

  return null;
}

async function requestAtsScore(
  resumeId: string,
  jobPostingId: string,
  addStep: (name: string, data?: unknown) => void,
): Promise<void> {
  try {
    await coreMutator<void>(
      {
        url: `/rpc/request_ats_score`,
        method: "POST",
        data: { resume_id: resumeId, job_id: jobPostingId },
      },
      { validateStatus: (s) => s === 204, ...testHttpOptions },
    );
    addStep("ats_score.requested", { resumeId, jobPostingId });
  } catch (error) {
    const classified = classifyRequestError(error);
    addStep("ats_score.request_failed", {
      ...classified,
      axios: serializeAxiosError(error),
    });
    throw error;
  }
}

export async function testOptimizerAction(
  resumeId: string,
): Promise<TestOptimizerResult> {
  const { addStep, finish } = createRequestLog("optimizer-test");
  let result: TestOptimizerResult = {
    ok: false,
    kind: "unknown",
    error: "Optimizer test did not run.",
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

      const jobResponse = await postJobPostings(
        undefined,
        {
          data: {
            user_id: userId,
            content: ARTIFICIAL_JOB_POSTING_CONTENT,
          },
          headers: {
            Prefer: "return=representation",
          },
          validateStatus: (status) => status === 201 || status === 200,
          ...testHttpOptions,
        },
      );
      const jobPostingId = extractJobPostingId(jobResponse);
      if (!jobPostingId) {
        result = {
          ok: false,
          kind: "core_api",
          error: "Core API did not return a job posting id.",
        };
        addStep("job_posting.missing_id", { jobResponse });
      } else {
        addStep("job_posting.created", { jobPostingId });

        await requestAtsScore(resumeId, jobPostingId, addStep);

        let optimization = await fetchLatestOptimizationForResume(resumeId);
        if (optimization) {
          addStep("optimisation.already_present", {
            optimizationId: optimization.id,
          });
        } else {
          optimization = await pollForOptimization(resumeId, addStep);
        }

        if (optimization) {
          try {
            const { coverLetterPreview } = await runCoverLetterGenerate(
              optimization.id,
              addStep,
            );
            result = {
              ok: true,
              optimisationId: optimization.id,
              coverLetterPreview,
            };
            addStep("action.success", result);
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
        } else {
          result = {
            ok: false,
            kind: "pipeline_timeout",
            error: `No optimization row within ${PIPELINE_POLL_TIMEOUT_MS / 1000}s after requesting ATS score.`,
          };
          addStep("poll.timeout", result);
        }
      }
    }
  } catch (e) {
    const classified = classifyRequestError(e);
    console.error("[testOptimizerAction]", e);
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
      console.info(`[optimizer-test] log written: ${logPath}`);
    }
  }

  return result;
}

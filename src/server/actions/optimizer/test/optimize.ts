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
  runCoverLetterGenerate,
} from "./cover-letter-shared";
import { getApiOptimisationsOptimisationIdCoverLetter } from "~/server/api/generated/optimizer/optimizer";
import { parseJobPostingForTest } from "./parse-job";
import {
  PIPELINE_POLL_TIMEOUT_MS,
  testHttpOptions,
} from "./constants";
import { classifyRequestError } from "./errors";
import type { OptimizerFailureKind } from "./errors";

const POLL_INITIAL_DELAY_MS = 500;
const POLL_MAX_DELAY_MS = 1_500;

interface OptimizeExperience {
  company?: string;
  title?: string;
  dates?: string;
  location?: string;
  bullets?: string[];
  hide?: boolean;
}

interface OptimizeSkillGroup {
  category: string;
  items: string[];
}

interface SuggestionExperience {
  company_name?: string | null;
  job_title?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  bullets?: string[] | null;
  entry_id?: string | null;
}

interface SuggestionBullet {
  id?: string;
  original?: string;
  rewritten?: string;
  xyz_applied?: boolean;
  keywords_added?: string[];
}

interface SuggestionWorkExperience {
  id?: string;
  reason?: string;
  bullets?: SuggestionBullet[];
  include?: boolean;
  entry_id?: string;
  rewrite_count?: number;
}

interface SuggestionSummaryObject {
  original?: string;
  rewritten?: string;
  rewrite_count?: number;
  keywords_incorporated?: string[];
}

interface SuggestionsJson {
  resume_experiences?: SuggestionExperience[];
  work_experiences?: SuggestionWorkExperience[];
  resume_skills?: string[];
  existing_summary?: string;
  summary?: string | SuggestionSummaryObject;
}


export type TestOptimizerResult =
  | {
      ok: true;
      optimisationId: string;
      coverLetterPreview?: string;
      coverLetterText?: string;
      optimizedResumePayload?: Record<string, unknown> | null;
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
  jobPostingId: string,
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
        job_posting_id: `eq.${jobPostingId}`,
        limit: "1",
      },
      {
        ...testHttpOptions,
        headers: {
          "X-Disable-Logging": "true",
        },
      },
    );
    const row = extractLatestOptimization(rows);

    let status: string | null = null;
    if (row?.ai_suggestions && typeof row.ai_suggestions === "object") {
      status = (row.ai_suggestions as Record<string, unknown>).status as string | null ?? null;
    }

    addStep("poll.optimizations", {
      attempt,
      found: Boolean(row),
      optimizationId: row?.id ?? null,
      status,
    });

    if (row && (status === "completed" || status === "failed")) {
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

      const parsedJobContent = await parseJobPostingForTest(addStep);

      const jobResponse = await postJobPostings(
        undefined,
        {
          data: {
            user_id: userId,
            content: parsedJobContent,
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

        const optimization = await pollForOptimization(resumeId, jobPostingId, addStep);

        if (!optimization) {
          result = {
            ok: false,
            kind: "pipeline_timeout",
            error: "Optimization pipeline timed out.",
          };
          addStep("optimisation.timeout", { resumeId, jobPostingId });
        } else {
          const suggestions = optimization.ai_suggestions as Record<string, unknown> | null | undefined;
          if (suggestions?.status === "failed") {
            const errMsg = (suggestions.error_message as string | undefined) ?? "Optimization pipeline failed on backend";
            result = {
              ok: false,
              kind: "optimizer_api",
              error: errMsg,
            };
            addStep("optimizer.failed_status", { error: errMsg });
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

              let optimizedResumePayload: Record<string, unknown> | null = null;
              if (optimization.ai_suggestions) {
                const suggestionsJson = optimization.ai_suggestions as unknown as SuggestionsJson;
                const originalContent = resume.content as Record<string, unknown> | null;
                
                const originalExperiences = (originalContent?.experience as OptimizeExperience[] | undefined) ?? [];
                const optExperiences = originalExperiences.map((exp) => {
                  const sugResumeExp = suggestionsJson.resume_experiences?.find(
                    (sugExp) => (sugExp.company_name ?? "") === (exp.company ?? "") && (sugExp.job_title ?? "") === (exp.title ?? "")
                  );
                  
                  let optBullets = exp.bullets;
                  if (sugResumeExp?.entry_id) {
                    const sugWorkExp = suggestionsJson.work_experiences?.find(
                      (workExp) => workExp.entry_id === sugResumeExp.entry_id
                    );
                    if (sugWorkExp?.bullets) {
                      optBullets = sugWorkExp.bullets
                        .map((b) => b.rewritten)
                        .filter((b): b is string => typeof b === "string");
                    }
                  }

                  return Object.assign({}, exp, {
                    bullets: optBullets,
                  });
                });

                const optSkills = suggestionsJson.resume_skills ? [
                  {
                    category: "Skills",
                    items: suggestionsJson.resume_skills
                  }
                ] : (originalContent?.skills as OptimizeSkillGroup[] | undefined);

                let optSummary = originalContent?.summary;
                const sugSummary = suggestionsJson.summary;
                if (sugSummary) {
                  if (typeof sugSummary === "object") {
                    optSummary = sugSummary.rewritten ?? originalContent?.summary;
                  } else if (typeof sugSummary === "string") {
                    optSummary = sugSummary;
                  }
                }

                optimizedResumePayload = Object.assign({}, originalContent, {
                  summary: optSummary,
                  experience: optExperiences,
                  skills: optSkills
                });

                addStep("optimizer.payload_comparison", {
                  original: originalContent,
                  optimized: optimizedResumePayload,
                });
              }

              result = {
                ok: true,
                optimisationId: optimization.id,
                coverLetterPreview,
                coverLetterText: savedCoverLetter?.coverLetter,
                optimizedResumePayload,
              };
              addStep("action.success", {
                ok: true,
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

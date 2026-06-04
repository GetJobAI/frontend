"use server";

import {
  postApiOptimisationsOptimisationIdBulletsBulletIdReview,
  postApiOptimisationsOptimisationIdWorkExperiencesSuggestionIdRewrite,
  getApiOptimisationsOptimisationIdCoverLetter,
  postApiOptimisationsOptimisationIdCoverLetterGenerate,
} from "~/server/api/generated/optimizer/optimizer";
import type {
  WorkExperienceRewriteResponse,
  CoverLetterResponse,
  GenerateCoverLetterRequest,
} from "~/server/api/generated/optimizer/schemas";
import {
  getOptimizations,
  deleteOptimizations,
  patchOptimizations,
} from "~/server/api/generated/optimizations/optimizations";
import { getJobPostings } from "~/server/api/generated/job-postings/job-postings";
import { getAtsScores } from "~/server/api/generated/ats-scores/ats-scores";
import { testHttpOptions } from "~/server/actions/optimizer/test/constants";

interface SuggestionBullet {
  id?: string;
  original?: string;
  rewritten?: string;
  accepted?: boolean | null;
}

interface SuggestionWorkExperience {
  id?: string;
  entry_id?: string;
  company_name?: string;
  job_title?: string;
  bullets?: SuggestionBullet[];
}

interface AiSuggestionsJson {
  overall_score?: number;
  job_title?: string;
  summary?: unknown;
  resume_skills?: string[];
  work_experiences?: SuggestionWorkExperience[];
}

export async function reviewBulletAction(
  optimisationId: string,
  bulletId: string,
  accepted: boolean | null,
): Promise<void> {
  if (accepted === null) {
    const opts = await getOptimizations(
      { id: `eq.${optimisationId}` },
      testHttpOptions,
    );
    if (Array.isArray(opts) && opts.length > 0) {
      const opt = opts[0];
      if (opt?.ai_suggestions) {
        const suggestions = opt.ai_suggestions as unknown as AiSuggestionsJson;
        let updated = false;
        if (
          suggestions?.work_experiences &&
          Array.isArray(suggestions.work_experiences)
        ) {
          for (const we of suggestions.work_experiences) {
            if (Array.isArray(we.bullets)) {
              for (const bullet of we.bullets) {
                if (bullet.id === bulletId) {
                  bullet.accepted = null;
                  updated = true;
                  break;
                }
              }
            }
            if (updated) break;
          }
        }
        if (updated) {
          await patchOptimizations(
            { id: `eq.${optimisationId}` },
            { data: { ai_suggestions: suggestions }, ...testHttpOptions },
          );
        }
      }
    }
  } else {
    await postApiOptimisationsOptimisationIdBulletsBulletIdReview(
      optimisationId,
      bulletId,
      { accepted },
    );
  }
}

export async function rewriteWorkExperienceAction(
  optimisationId: string,
  suggestionId: string,
  hint: string,
): Promise<WorkExperienceRewriteResponse> {
  const response =
    await postApiOptimisationsOptimisationIdWorkExperiencesSuggestionIdRewrite(
      optimisationId,
      suggestionId,
      { hint },
    );

  // Normalize the accepted status of the new rewritten bullets to null in the database
  const opts = await getOptimizations(
    { id: `eq.${optimisationId}` },
    testHttpOptions,
  );
  if (Array.isArray(opts) && opts.length > 0) {
    const opt = opts[0];
    if (opt?.ai_suggestions) {
      const suggestions = opt.ai_suggestions as unknown as AiSuggestionsJson;
      let updated = false;
      if (
        suggestions?.work_experiences &&
        Array.isArray(suggestions.work_experiences)
      ) {
        for (const we of suggestions.work_experiences) {
          if (
            we.id === suggestionId &&
            we.bullets &&
            Array.isArray(we.bullets)
          ) {
            for (const bullet of we.bullets) {
              bullet.accepted = null;
              updated = true;
            }
          }
        }
      }
      if (updated) {
        await patchOptimizations(
          { id: `eq.${optimisationId}` },
          { data: { ai_suggestions: suggestions }, ...testHttpOptions },
        ).catch((err) => {
          console.error(
            "Failed to patch rewritten experience suggestions to null:",
            err,
          );
        });
      }
    }
  }

  return response;
}

export interface OptimizationListItem {
  id: string;
  created_at: string;
  companyName: string;
  jobTitle: string;
  originalScore: number;
  liveScore: number;
  targetScore: number;
}

export async function deleteOptimizationAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteOptimizations(
      {
        id: `eq.${id}`,
      },
      testHttpOptions,
    );
    return { ok: true };
  } catch (err) {
    console.error("Failed to delete optimization:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function calculateLiveScore(
  originalScore: number,
  suggestions: AiSuggestionsJson | null | undefined,
): number {
  if (!suggestions || typeof suggestions !== "object") return originalScore;

  let totalItems = 0;
  let acceptedItemsCount = 0;

  if (suggestions.summary) totalItems += 1;
  if (suggestions.resume_skills?.length) totalItems += 1;

  if (
    suggestions.work_experiences &&
    Array.isArray(suggestions.work_experiences)
  ) {
    suggestions.work_experiences.forEach((we) => {
      if (we.bullets && Array.isArray(we.bullets)) {
        we.bullets.forEach((b) => {
          totalItems += 1;
          if (b.accepted === true) {
            acceptedItemsCount += 1;
          }
        });
      }
    });
  }

  const targetScore = Math.max(originalScore + 15, 85);
  return totalItems > 0
    ? Math.min(
        100,
        Math.round(
          originalScore +
            (acceptedItemsCount / totalItems) * (targetScore - originalScore),
        ),
      )
    : originalScore;
}

export async function listOptimizationsAction(
  resumeId: string,
): Promise<OptimizationListItem[]> {
  try {
    const opts = await getOptimizations(
      {
        resume_id: `eq.${resumeId}`,
        order: "created_at.desc",
      },
      testHttpOptions,
    );

    if (!Array.isArray(opts) || opts.length === 0) {
      return [];
    }

    const jobPostingIds = opts
      .map((o) => o.job_posting_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    const atsScoreIds = opts
      .map((o) => o.ats_score_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (jobPostingIds.length === 0) {
      return opts.map((o) => ({
        id: o.id,
        created_at: o.created_at,
        companyName: "",
        jobTitle: "Unknown Title",
        originalScore: 60,
        liveScore: 60,
        targetScore: 85,
      }));
    }

    const [postings, scores] = await Promise.all([
      getJobPostings(
        {
          id: `in.(${jobPostingIds.join(",")})`,
        },
        testHttpOptions,
      ).catch(() => []),
      atsScoreIds.length > 0
        ? getAtsScores(
            {
              id: `in.(${atsScoreIds.join(",")})`,
            },
            testHttpOptions,
          ).catch(() => [])
        : [],
    ]);

    const postingsMap = new Map<string, unknown>();
    if (Array.isArray(postings)) {
      postings.forEach((p) => {
        if (p.id) {
          postingsMap.set(p.id, p.content);
        }
      });
    }

    const scoresMap = new Map<string, number>();
    if (Array.isArray(scores)) {
      scores.forEach((s) => {
        if (s.id) {
          scoresMap.set(s.id, s.score);
        }
      });
    }

    return opts.map((o) => {
      const content = postingsMap.get(o.job_posting_id) as
        | Record<string, unknown>
        | undefined;
      let companyName = "";
      let jobTitle = "Unknown Title";

      if (content) {
        if (typeof content.company === "string") companyName = content.company;
        else if (typeof content.company_name === "string")
          companyName = content.company_name;

        if (typeof content.title === "string") jobTitle = content.title;
        else if (typeof content.job_title === "string")
          jobTitle = content.job_title;
      }

      if (jobTitle === "Unknown Title" && o.ai_suggestions) {
        const sug = o.ai_suggestions as Record<string, unknown>;
        if (typeof sug.job_title === "string") {
          jobTitle = sug.job_title;
        }
      }

      let originalScore = 60;
      if (scoresMap.has(o.ats_score_id)) {
        originalScore = scoresMap.get(o.ats_score_id)!;
      } else if (o.ai_suggestions && typeof o.ai_suggestions === "object") {
        const sug = o.ai_suggestions as Record<string, unknown>;
        if (typeof sug.overall_score === "number") {
          originalScore = sug.overall_score;
        }
      }

      const liveScore = calculateLiveScore(
        originalScore,
        o.ai_suggestions as AiSuggestionsJson,
      );
      const targetScore = Math.min(100, Math.max(originalScore + 15, 85));

      return {
        id: o.id,
        created_at: o.created_at,
        companyName,
        jobTitle,
        originalScore,
        liveScore,
        targetScore,
      };
    });
  } catch (e) {
    console.error("Failed to list optimizations:", e);
    return [];
  }
}

export async function getCoverLetterAction(
  optimisationId: string,
): Promise<CoverLetterResponse | null> {
  try {
    return await getApiOptimisationsOptimisationIdCoverLetter(
      optimisationId,
      testHttpOptions,
    );
  } catch (e) {
    console.error("Failed to get cover letter:", e);
    return null;
  }
}

export async function generateCoverLetterAction(
  optimisationId: string,
  payload: GenerateCoverLetterRequest,
): Promise<CoverLetterResponse> {
  try {
    return await postApiOptimisationsOptimisationIdCoverLetterGenerate(
      optimisationId,
      payload,
      testHttpOptions,
    );
  } catch (e) {
    console.error("Failed to generate cover letter:", e);
    throw e;
  }
}

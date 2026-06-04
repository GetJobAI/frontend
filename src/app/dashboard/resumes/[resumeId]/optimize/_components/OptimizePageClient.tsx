"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  ChevronLeft,
  CheckCheck,
  Save,
  Award,
  Briefcase,
  Code,
  Loader2,
  Home,
  Mail,
} from "lucide-react";
import { AtsScoreMetric } from "./AtsScoreMetric";
import { SuggestionCard } from "./SuggestionCard";
import { TypstLivePreview } from "./TypstLivePreview";
import type { AiSuggestions } from "./TypstLivePreview";
import type {
  ResumeContent,
  ExperienceEntry,
} from "~/app/dashboard/resumes/[resumeId]/_components/resume-content-types";
import type { Optimizations } from "~/server/api/generated/schemas";
import {
  reviewBulletAction,
  rewriteWorkExperienceAction,
} from "~/server/actions/optimizer/actions";
import { updateResumeContentAction } from "~/server/actions/resume/actions";
import { toast } from "sonner";

interface OptimizePageClientProps {
  resumeId: string;
  initialResumeContent: ResumeContent;
  optimization: Optimizations;
}

export function OptimizePageClient({
  resumeId,
  initialResumeContent,
  optimization,
}: OptimizePageClientProps) {
  const router = useRouter();
  const [isSaving, startSave] = useTransition();

  // Load the suggestions and metadata from the optimization payload
  const suggestions =
    (optimization?.ai_suggestions as AiSuggestions | null | undefined) ?? {};
  const [localSuggestions, setLocalSuggestions] =
    useState<AiSuggestions>(suggestions);

  // Parse original ATS score
  const originalScore = localSuggestions?.overall_score ?? 60;

  // Initialize review states: true (accepted), false (declined), null (pending)
  // For Summary
  const [summaryReview, setSummaryReview] = useState<boolean | null>(null);

  // For Skills
  const [skillsReview, setSkillsReview] = useState<boolean | null>(null);

  // For individual Experience bullet suggestions
  const [bulletReviews, setBulletReviews] = useState<
    Record<string, boolean | null>
  >(() => {
    const initial: Record<string, boolean | null> = {};
    localSuggestions?.work_experiences?.forEach((we) => {
      we.bullets?.forEach((bullet) => {
        if (bullet.id) {
          initial[bullet.id] = bullet.accepted ?? null;
        }
      });
    });
    return initial;
  });

  // Keep track of experience level loading states for rewrites
  const [rewritingExperienceId, setRewritingExperienceId] = useState<
    string | null
  >(null);

  // Check how many review items exist and how many are accepted
  const totalItems = (() => {
    let count = 0;
    if (localSuggestions?.summary) count += 1;
    if (localSuggestions?.resume_skills?.length) count += 1;
    localSuggestions?.work_experiences?.forEach((we) => {
      count += we.bullets?.length ?? 0;
    });
    return count;
  })();

  const acceptedItemsCount = (() => {
    let count = 0;
    if (summaryReview === true) count += 1;
    if (skillsReview === true) count += 1;
    Object.values(bulletReviews).forEach((val) => {
      if (val === true) count += 1;
    });
    return count;
  })();

  // Estimate the live score dynamically: original -> target (88) based on progress
  const targetScore = Math.max(originalScore + 15, 85);
  const liveScore =
    totalItems > 0
      ? Math.min(
          100,
          Math.round(
            originalScore +
              (acceptedItemsCount / totalItems) * (targetScore - originalScore),
          ),
        )
      : originalScore;

  // Review handlers
  const handleBulletReview = async (
    bulletId: string,
    accepted: boolean | null,
  ) => {
    const previous = bulletReviews[bulletId] ?? null;
    // Optimistic UI update
    setBulletReviews((prev) => ({ ...prev, [bulletId]: accepted }));
    try {
      await reviewBulletAction(optimization.id, bulletId, accepted);
    } catch (e) {
      console.error("Failed to review bullet:", e);
      toast.error("Failed to update suggestion status on server");
      // Revert status
      setBulletReviews((prev) => ({ ...prev, [bulletId]: previous }));
    }
  };

  // Rewrite experience handler
  const handleExperienceRewrite = async (
    suggestionId: string,
    entryId: string,
    hint: string,
  ) => {
    setRewritingExperienceId(suggestionId);
    try {
      const response = await rewriteWorkExperienceAction(
        optimization.id,
        suggestionId,
        hint,
      );

      // Merge new bullets into local suggestions state
      setLocalSuggestions((prev) => {
        const nextWorkExps = prev.work_experiences?.map((we) => {
          if (we.id === suggestionId) {
            return {
              ...we,
              bullets: response.bullets,
              rewrite_count: response.rewriteCount ?? we.rewrite_count,
            };
          }
          return we;
        });

        return {
          ...prev,
          work_experiences: nextWorkExps,
        };
      });

      // Reset the reviews for the new bullets to pending
      setBulletReviews((prev) => {
        const next = { ...prev };
        response.bullets?.forEach((b) => {
          if (b.id) {
            next[b.id] = null;
          }
        });
        return next;
      });

      toast.success("AI generated new experience suggestions!");
    } catch (e) {
      console.error("Failed to rewrite experience:", e);
      toast.error("Failed to generate rewrites. Try again.");
    } finally {
      setRewritingExperienceId(null);
    }
  };

  // Apply accepted changes and save resume content back to database
  const handleApplyAndExit = () => {
    startSave(async () => {
      try {
        const finalContent = { ...initialResumeContent };

        // 1. Apply summary
        if (summaryReview === true && localSuggestions.summary) {
          const sugSummary = localSuggestions.summary;
          finalContent.summary =
            typeof sugSummary === "object" ? sugSummary.rewritten : sugSummary;
        }

        // 2. Apply skills
        if (skillsReview === true && localSuggestions.resume_skills) {
          finalContent.skills = [
            {
              category: "Skills",
              items: localSuggestions.resume_skills,
            },
          ];
        }

        if (finalContent.experience && localSuggestions.work_experiences) {
          finalContent.experience = finalContent.experience.map(
            (exp: ExperienceEntry & { entry_id?: string }) => {
              const mappedExp = (
                localSuggestions as {
                  resume_experiences?: {
                    company_name?: string;
                    job_title?: string;
                    entry_id?: string;
                  }[];
                }
              )?.resume_experiences?.find(
                (re) =>
                  (re.company_name ?? "").trim().toLowerCase() ===
                    (exp.company ?? "").trim().toLowerCase() &&
                  (re.job_title ?? "").trim().toLowerCase() ===
                    (exp.title ?? "").trim().toLowerCase(),
              );
              const targetEntryId = mappedExp?.entry_id ?? exp.entry_id;
              const sugExp = localSuggestions.work_experiences?.find(
                (we) => we.entry_id === targetEntryId,
              );
              if (sugExp?.bullets) {
                const updatedBullets = (exp.bullets ?? []).map(
                  (bullet: string, idx: number) => {
                    const bulletSug = sugExp.bullets.find(
                      (b) =>
                        b.original === bullet ||
                        idx === sugExp.bullets.indexOf(b),
                    );
                    if (bulletSug && bulletReviews[bulletSug.id] === true) {
                      return bulletSug.rewritten;
                    }
                    return bullet;
                  },
                );
                return { ...exp, bullets: updatedBullets };
              }
              return exp;
            },
          );
        }

        // Save back to DB
        const res = await updateResumeContentAction(resumeId, finalContent);
        if (res.ok) {
          toast.success("Optimized changes applied to resume!");
          router.push(`/dashboard/resumes/${resumeId}`);
        } else {
          throw new Error("Failed to save changes");
        }
      } catch (e) {
        console.error("Failed to apply optimization:", e);
        toast.error("Failed to apply changes to resume.");
      }
    });
  };

  const handleAcceptAll = () => {
    // Set all reviews to true
    if (localSuggestions.summary) setSummaryReview(true);
    if (localSuggestions.resume_skills) setSkillsReview(true);

    const nextReviews = { ...bulletReviews };
    localSuggestions.work_experiences?.forEach((we) => {
      we.bullets?.forEach((bullet) => {
        if (bullet.id) {
          nextReviews[bullet.id] = true;
          // Trigger backend review in fire-and-forget style
          void reviewBulletAction(optimization.id, bullet.id, true).catch(
            console.error,
          );
        }
      });
    });
    setBulletReviews(nextReviews);
    toast.success("All suggestions accepted!");
  };

  const handleResetAll = () => {
    setSummaryReview(null);
    setSkillsReview(null);
    const nextReviews = { ...bulletReviews };
    Object.keys(nextReviews).forEach((k) => {
      nextReviews[k] = null;
      void reviewBulletAction(optimization.id, k, null).catch(console.error);
    });
    setBulletReviews(nextReviews);
    toast.success("Reset all suggestions to pending");
  };

  return (
    <div className="grid min-w-0 flex-1 grid-cols-1 overflow-y-auto md:h-full md:min-h-0 md:grid-cols-2 md:overflow-hidden">
      <div className="flex h-auto w-full min-w-0 flex-col border-b border-white/8 bg-neutral-950 md:h-full md:min-h-0 md:border-r md:border-b-0">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/6 bg-neutral-900/20 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/resumes/${resumeId}`)}
                title="Back to editor"
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-neutral-400 transition-colors hover:bg-white/8 hover:text-white"
              >
                <ChevronLeft className="size-4" />
              </button>

              <Link
                href="/dashboard"
                title="Back to dashboard"
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-neutral-400 transition-colors hover:bg-white/8 hover:text-white"
              >
                <Home className="size-4" strokeWidth={1.8} />
              </Link>

              <div
                className="flex size-8 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-neutral-400"
                title="User Profile"
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "size-5 ring-0 transition-all",
                      userButtonTrigger:
                        "bg-transparent hover:bg-transparent focus:shadow-none focus:outline-none focus:ring-0",
                    },
                  }}
                />
              </div>
            </div>

            <div className="h-5 w-px shrink-0 bg-white/10" />

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-white">
                AI Optimization Review
              </h1>
              <p className="truncate text-[11px] text-neutral-500">
                {localSuggestions.job_title ?? "Target Role Tailoring"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/resumes/${resumeId}/cover-letter?optimisationId=${optimization.id}`,
                )
              }
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-violet-500/25 bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/20 hover:text-violet-300"
            >
              <Mail className="size-3.5" />
              Cover Letter
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <CheckCheck className="size-3.5" />
              Accept All
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <AtsScoreMetric originalScore={originalScore} liveScore={liveScore} />

          <div className="flex flex-col gap-6">
            {localSuggestions.summary && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                  <Award className="size-4 text-violet-400" />
                  Professional Summary
                </div>
                <SuggestionCard
                  original={
                    typeof localSuggestions.summary === "object"
                      ? localSuggestions.summary.original
                      : (initialResumeContent.summary ?? "")
                  }
                  rewritten={
                    typeof localSuggestions.summary === "object"
                      ? localSuggestions.summary.rewritten
                      : localSuggestions.summary
                  }
                  status={summaryReview}
                  onAccept={() => setSummaryReview(true)}
                  onDecline={() => setSummaryReview(false)}
                  onReset={() => setSummaryReview(null)}
                />
              </div>
            )}

            {localSuggestions.work_experiences &&
              localSuggestions.work_experiences.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    <Briefcase className="size-4 text-violet-400" />
                    Work Experience ({localSuggestions.work_experiences.length})
                  </div>

                  {localSuggestions.work_experiences.map((we) => {
                    const mappedExp = (
                      localSuggestions as {
                        resume_experiences?: {
                          company_name?: string;
                          job_title?: string;
                          entry_id?: string;
                        }[];
                      }
                    )?.resume_experiences?.find(
                      (re) => re.entry_id === we.entry_id,
                    );
                    const targetCompany =
                      mappedExp?.company_name ?? we.company_name;
                    const targetTitle = mappedExp?.job_title ?? we.job_title;
                    const originalExp = initialResumeContent.experience?.find(
                      (e) =>
                        (e.company ?? "").trim().toLowerCase() ===
                          (targetCompany ?? "").trim().toLowerCase() &&
                        (e.title ?? "").trim().toLowerCase() ===
                          (targetTitle ?? "").trim().toLowerCase(),
                    );
                    const companyName =
                      we.company_name ??
                      originalExp?.company ??
                      "Work Experience";
                    const jobTitle = we.job_title ?? originalExp?.title ?? "";

                    return (
                      <div
                        key={we.id}
                        className="flex flex-col gap-3 rounded-xl border border-white/6 bg-white/2 p-4"
                      >
                        <div className="flex items-start justify-between gap-3 border-b border-white/6 pb-2">
                          <div>
                            <h3 className="text-sm leading-tight font-bold text-white">
                              {companyName}
                            </h3>
                            <p className="mt-0.5 text-xs text-neutral-400">
                              {jobTitle}
                            </p>
                          </div>
                          {we.rewrite_count > 0 && (
                            <span className="rounded border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-400">
                              Rewritten {we.rewrite_count}x
                            </span>
                          )}
                        </div>

                        {we.reason && (
                          <p className="rounded-lg border border-white/4 bg-black/20 p-2 text-xs text-neutral-500 italic">
                            <strong>AI Rationale:</strong> {we.reason}
                          </p>
                        )}

                        <div className="flex flex-col gap-3">
                          {we.bullets?.map((bullet, idx: number) => {
                            const origBulletText =
                              originalExp?.bullets?.[idx] ??
                              bullet.original ??
                              "";

                            return (
                              <SuggestionCard
                                key={bullet.id || idx}
                                title={`Bullet Point ${idx + 1}`}
                                original={origBulletText}
                                rewritten={bullet.rewritten}
                                status={bulletReviews[bullet.id] ?? null}
                                onAccept={() =>
                                  handleBulletReview(bullet.id, true)
                                }
                                onDecline={() =>
                                  handleBulletReview(bullet.id, false)
                                }
                                onReset={() =>
                                  handleBulletReview(bullet.id, null)
                                }
                              />
                            );
                          })}
                        </div>

                        <div className="pt-1">
                          <SuggestionCard
                            original=""
                            rewritten=""
                            status={null}
                            onAccept={() => undefined}
                            onDecline={() => undefined}
                            onReset={() => undefined}
                            onRewrite={(hint) =>
                              handleExperienceRewrite(we.id, we.entry_id, hint)
                            }
                            isRewriting={rewritingExperienceId === we.id}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {localSuggestions.resume_skills &&
              localSuggestions.resume_skills.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    <Code className="size-4 text-violet-400" />
                    Skills Optimisation
                  </div>
                  <SuggestionCard
                    title="Missing Keywords Added"
                    original={(
                      initialResumeContent.skills?.[0]?.items ?? []
                    ).join(", ")}
                    rewritten={localSuggestions.resume_skills?.join(", ") ?? ""}
                    status={skillsReview}
                    onAccept={() => setSkillsReview(true)}
                    onDecline={() => setSkillsReview(false)}
                    onReset={() => setSkillsReview(null)}
                  />
                </div>
              )}
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/6 bg-neutral-900/40 px-5 py-4">
          <button
            type="button"
            onClick={handleResetAll}
            className="cursor-pointer rounded-lg border border-white/8 px-4 py-2.5 text-xs font-semibold text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            Reset All
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleApplyAndExit}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/10 transition-all hover:bg-violet-500 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isSaving ? "Applying Diffs…" : "Apply & Exit"}
          </button>
        </footer>
      </div>

      <div className="flex h-[70vh] w-full min-w-0 flex-col bg-neutral-950 md:h-full md:min-h-0">
        <TypstLivePreview
          resumeContent={initialResumeContent}
          optimization={optimization}
          activeReviews={Object.assign(
            {},
            bulletReviews,
            { summary: summaryReview },
            { skills: skillsReview },
          )}
        />
      </div>
    </div>
  );
}

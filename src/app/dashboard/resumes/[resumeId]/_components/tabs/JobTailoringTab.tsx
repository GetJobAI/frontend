"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Trash2 } from "lucide-react";
import { testOptimizerAction } from "~/server/actions/optimizer/test/optimize";
import {
  listOptimizationsAction,
  deleteOptimizationAction,
  type OptimizationListItem,
} from "~/server/actions/optimizer/actions";
import { ConfirmDialog } from "~/components/global/ConfirmDialog";
import { cn } from "~/lib/utils";

interface JobTailoringTabProps {
  resumeId: string;
}

function appendLogPath(parts: string[], logPath?: string | null): string {
  if (logPath) {
    parts.push(`Log: ${logPath}`);
  }
  return parts.join("\n\n");
}

function formatUpdatedTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (diffHours < 24) {
    return minutes > 0
      ? `${diffHours} hr ${minutes} min ago`
      : `${diffHours} hr ago`;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function JobTailoringTab({ resumeId }: JobTailoringTabProps) {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isOptimizePending, startOptimize] = useTransition();

  const [optimizations, setOptimizations] = useState<OptimizationListItem[]>(
    [],
  );
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOpts() {
      try {
        const list = await listOptimizationsAction(resumeId);
        setOptimizations(list);
      } catch (err) {
        console.error("Failed to load previous optimizations:", err);
      } finally {
        setIsLoadingList(false);
      }
    }
    void loadOpts();
  }, [resumeId]);

  const handleDelete = async (optId: string) => {
    setDeletingId(optId);
    try {
      const result = await deleteOptimizationAction(optId);
      if (result.ok) {
        setOptimizations((prev) => prev.filter((o) => o.id !== optId));
      } else {
        console.error("Failed to delete optimization:", result.error);
      }
    } catch (err) {
      console.error("Error during deletion:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOptimize = () => {
    setTestStatus(null);
    startOptimize(async () => {
      const result = await testOptimizerAction(resumeId, jobDescription);

      if (result.ok) {
        router.push(
          `/dashboard/resumes/${resumeId}/optimize?optimisationId=${result.optimisationId}`,
        );
      } else {
        setTestStatus(
          appendLogPath([`[${result.kind}] ${result.error}`], result.logPath),
        );
      }
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-400">
          Job description text
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here…"
          className="h-44 w-full shrink-0 resize-none rounded-lg border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-white transition-all placeholder:text-neutral-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleOptimize}
        disabled={isOptimizePending || !jobDescription.trim()}
        className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition-all hover:border-violet-400/40 hover:bg-violet-500/15 disabled:cursor-default disabled:opacity-50 disabled:hover:border-violet-500/25 disabled:hover:bg-violet-500/10"
      >
        {isOptimizePending ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <Sparkles className="size-4" strokeWidth={1.7} />
        )}
        {isOptimizePending ? "Tailoring to role…" : "Optimize with AI"}
      </button>

      {testStatus ? (
        <pre className="max-h-24 shrink-0 overflow-y-auto rounded-lg border border-white/8 bg-black/30 p-3 text-xs whitespace-pre-wrap text-neutral-300">
          {testStatus}
        </pre>
      ) : null}

      {/* Optimization History List */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 border-t border-white/8 pt-4">
        <h3 className="shrink-0 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          Previous Optimizations
        </h3>

        {isLoadingList ? (
          <div className="flex shrink-0 items-center gap-2 py-2 text-xs text-neutral-500">
            <Loader2 className="size-3 animate-spin" />
            Loading previous runs...
          </div>
        ) : optimizations.length === 0 ? (
          <div className="shrink-0 py-2 text-xs text-neutral-600 italic">
            No previous optimization runs found.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
            {optimizations.map((opt) => (
              <div
                key={opt.id}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3.5 transition-all hover:border-violet-500/30 hover:bg-white/4"
              >
                <button
                  type="button"
                  onClick={() => {
                    router.push(
                      `/dashboard/resumes/${resumeId}/optimize?optimisationId=${opt.id}`,
                    );
                  }}
                  className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-1 text-left"
                >
                  <span className="w-full truncate text-sm font-semibold text-white transition-colors group-hover:text-violet-300">
                    {opt.jobTitle}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    {opt.companyName &&
                      opt.companyName !== "Unknown Company" && (
                        <>
                          <span className="max-w-[120px] truncate font-sans font-normal text-neutral-400">
                            {opt.companyName}
                          </span>
                          <span className="text-neutral-700">•</span>
                        </>
                      )}
                    <span>
                      Updated {formatUpdatedTime(new Date(opt.created_at))}
                    </span>
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  {opt.originalScore !== undefined &&
                    opt.targetScore !== undefined && (
                      <span
                        className={cn(
                          "flex h-8 shrink-0 items-center justify-center rounded-md border px-2.5 text-xs leading-none font-semibold transition-colors",
                          opt.targetScore > opt.originalScore
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-white/8 bg-white/4 text-neutral-400",
                        )}
                        title={
                          opt.targetScore > opt.originalScore
                            ? `ATS Score can improve from ${opt.originalScore} to ${opt.targetScore}`
                            : `ATS Score: ${opt.originalScore}`
                        }
                      >
                        {opt.targetScore > opt.originalScore
                          ? `${opt.originalScore} → ${opt.targetScore}`
                          : opt.originalScore}
                      </span>
                    )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(opt.id);
                    }}
                    disabled={deletingId === opt.id}
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/8 bg-white/2 text-neutral-500 transition-all hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    title="Delete optimization"
                  >
                    {deletingId === opt.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete this optimization?"
        description="This will permanently remove this optimization run from your history."
        confirmLabel={deletingId ? "Deleting..." : "Delete"}
        onConfirm={async () => {
          if (deleteTargetId) {
            await handleDelete(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
      />
    </div>
  );
}

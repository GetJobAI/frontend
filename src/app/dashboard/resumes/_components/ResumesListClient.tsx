"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowUpRight, FileText, Sparkles, Trash2 } from "lucide-react";

import { ConfirmDialog } from "~/components/global/ConfirmDialog";
import { Button } from "~/components/ui/button";
import { deleteResumeAction } from "~/server/actions/resume/actions";
import { cn } from "~/lib/utils";

type ResumeItem = {
  id: string;
  content: unknown;
  inputMethod: string | null;
  parseStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface ResumesListClientProps {
  resumes: ResumeItem[];
}

function getResumeTitle(content: unknown): string {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return "Untitled resume";
  }
  const contact = (content as Record<string, unknown>).contact;
  if (contact && typeof contact === "object" && !Array.isArray(contact)) {
    const name = (contact as Record<string, unknown>).name;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return "Untitled resume";
}

function getResumeStyle(content: unknown): string | null {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }
  const style = (content as Record<string, unknown>).style;
  return typeof style === "string" && style.trim() ? style : null;
}

function formatSource(method: string | null): string {
  if (!method) return "Unknown source";
  return method.replace(/_/g, " ");
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

function ResumeBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-neutral-400 uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

function ResumeDocArt() {
  return (
    <div className="relative mx-auto w-[120px]" aria-hidden>
      {/* shadow card */}
      <div className="absolute top-3 left-3 h-full w-full rounded-2xl border border-white/4 bg-white/2" />
      {/* main card */}
      <div className="relative rounded-2xl border border-white/8 bg-[#131313] p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-violet-500/20" />
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-16 rounded-full bg-white/12" />
            <div className="h-1.5 w-10 rounded-full bg-white/6" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {[14, 20, 12, 18, 10].map((w, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-white/8"
              style={{ width: `${w * 4}px` }}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          {[16, 22, 14].map((w, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-white/6"
              style={{ width: `${w * 4}px` }}
            />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <ResumeDocArt />
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Build your first resume
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
            Choose how you want to start. We&apos;ll help you create a tailored
            resume that gets past ATS filters.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ResumesListClient({ resumes }: ResumesListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<ResumeItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const rows = useMemo(() => resumes, [resumes]);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteError(null);

    startTransition(() => {
      void (async () => {
        const result = await deleteResumeAction(deleteTarget.id);
        if (!result.ok) {
          setDeleteError(result.error);
          return;
        }
        setDeleteTarget(null);
        router.refresh();
      })();
    });
  };

  if (rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex shrink-0 items-end justify-between gap-3 px-0.5">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
              Your library
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {rows.length} resume{rows.length === 1 ? "" : "s"}
            </h2>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-0.5">
          {rows.map((resume) => {
            const title = getResumeTitle(resume.content);
            const style = getResumeStyle(resume.content);
            const editorHref = `/dashboard/resumes/${resume.id}`;
            const optimizeHref = `${editorHref}?tab=job-tailoring`;

            return (
              <article
                key={resume.id}
                className="card-surface card-surface-hover group relative overflow-hidden"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-violet-600/8 opacity-60 blur-3xl transition-opacity group-hover:opacity-100"
                />

                <div className="relative flex flex-col lg:flex-row lg:items-stretch">
                  <Link
                    href={editorHref}
                    className="flex min-w-0 flex-1 gap-5 p-5 transition-colors sm:p-6 lg:pr-4"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/6 bg-white/3 text-violet-400">
                      <FileText className="size-5" strokeWidth={1.7} />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-3">
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-lg font-semibold text-white transition-colors group-hover:text-violet-100">
                            {title}
                          </span>
                          <span className="mt-1 block text-sm text-neutral-500">
                            Updated{" "}
                            {formatUpdatedTime(new Date(resume.updatedAt))}
                          </span>
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 text-neutral-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-400" />
                      </span>

                      <span className="flex flex-wrap items-center gap-2">
                        {style ? (
                          <ResumeBadge className="text-violet-300/90 capitalize">
                            {style}
                          </ResumeBadge>
                        ) : null}
                        <ResumeBadge>
                          {formatSource(resume.inputMethod)}
                        </ResumeBadge>
                        {resume.parseStatus ? (
                          <ResumeBadge>{resume.parseStatus}</ResumeBadge>
                        ) : null}
                      </span>
                    </span>
                  </Link>

                  <div className="flex w-full shrink-0 gap-2 border-t border-white/6 p-4 sm:gap-3 sm:px-6 lg:w-auto lg:items-center lg:border-t-0 lg:border-l lg:p-5">
                    <Button
                      asChild
                      title="Optimize for a job"
                      className="h-12 min-w-0 flex-1 cursor-pointer rounded-xl border border-violet-500/25 bg-violet-500/10 text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.12)] transition-all hover:border-violet-400/45 hover:bg-violet-500/16 hover:text-white lg:size-12 lg:flex-none lg:border"
                    >
                      <Link
                        href={optimizeHref}
                        className="inline-flex items-center justify-center gap-2"
                      >
                        <Sparkles className="size-5 shrink-0" />
                        <span className="text-sm font-medium lg:hidden">
                          Optimize
                        </span>
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      title="Delete resume"
                      className="h-12 min-w-0 flex-1 cursor-pointer rounded-xl border-white/8 bg-transparent text-neutral-500 hover:border-red-500/30 hover:bg-red-500/8 hover:text-red-300 lg:size-12 lg:flex-none lg:px-0"
                      onClick={() => setDeleteTarget(resume)}
                    >
                      <Trash2 className="size-5 shrink-0" />
                      <span className="text-sm font-medium lg:hidden">
                        Delete
                      </span>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        title="Delete this resume?"
        description="This will permanently remove this resume from your account."
        confirmLabel={isPending ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
      />

      {deleteError ? (
        <div className="fixed right-6 bottom-6 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs text-red-200">
          {deleteError}
        </div>
      ) : null}
    </>
  );
}

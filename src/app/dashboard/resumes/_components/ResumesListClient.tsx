"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  FileJson,
  Pencil,
  Sparkles,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react";
import type { ComponentType } from "react";

import { ConfirmDeleteDialog } from "~/components/global/ConfirmDeleteDialog";
import { ResumeJsonDialog } from "~/components/global/ResumeJsonDialog";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { deleteResumeAction } from "~/app/dashboard/resumes/actions";
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

const LinkedInIcon: ComponentType<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path
      d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"
      strokeWidth="1.7"
    />
    <rect x="2" y="9" width="4" height="12" strokeWidth="1.7" />
    <circle cx="4" cy="4" r="2" strokeWidth="1.7" />
  </svg>
);

const createPaths: Array<{
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    href: "/dashboard/resumes/upload",
    title: "Upload Resume",
    description: "Upload PDF or DOCX and parse automatically",
    icon: Upload,
  },
  {
    href: "/dashboard/resumes/wizard",
    title: "Wizard Builder",
    description: "Build from scratch in guided 9 steps",
    icon: WandSparkles,
  },
  {
    href: "/dashboard/resumes/linkedin",
    title: "LinkedIn Import",
    description: "Import your LinkedIn ZIP export",
    icon: LinkedInIcon,
  },
];

export function ResumesListClient({ resumes }: ResumesListClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedResume, setSelectedResume] = useState<ResumeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResumeItem | null>(null);
  const [optimizeInfoOpen, setOptimizeInfoOpen] = useState(false);
  const [editInfoOpen, setEditInfoOpen] = useState(false);
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

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Resumes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create, inspect, and manage all of your resumes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {createPaths.map((path) => {
          const Icon = path.icon;
          return (
            <Link
              key={path.href}
              href={path.href}
              className="group card-surface card-surface-hover flex min-h-[132px] flex-col justify-between p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-violet-500/15 p-2 text-violet-400">
                  <Icon className="size-4" />
                </span>
                <ArrowRight className="size-4 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-violet-400" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-white">{path.title}</p>
                <p className="text-xs text-neutral-500">{path.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card-surface flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-white/6 px-4 py-3 text-sm font-medium text-neutral-300">
          Existing resumes ({rows.length})
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <FileJson className="size-6 text-violet-400/60" />
            <p className="text-sm font-medium text-white">No resumes yet</p>
            <p className="text-xs text-neutral-500">
              Use one of the creation paths above to generate your first resume.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/6">
            {rows.map((resume) => (
              <div
                key={resume.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedResume(resume)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedResume(resume);
                  }
                }}
                className="group cursor-pointer flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-white/3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-medium text-white">
                    Resume {resume.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {resume.inputMethod ?? "unknown"} · {resume.parseStatus ?? "pending"}{" "}
                    · updated {new Date(resume.updatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    className="border-violet-500/25 bg-white/4 text-violet-300 shadow-[0_0_0_rgba(124,58,237,0)] transition-all hover:border-violet-400/55 hover:bg-violet-500/10 hover:text-violet-200 hover:shadow-[0_0_18px_rgba(124,58,237,0.45)]"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOptimizeInfoOpen(true);
                    }}
                    title="Optimize (coming soon)"
                  >
                    <Sparkles />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    title="Edit (coming soon)"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditInfoOpen(true);
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="destructive"
                    title="Delete resume"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteTarget(resume);
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ResumeJsonDialog
        open={Boolean(selectedResume)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedResume(null);
          }
        }}
        resumeContent={selectedResume?.content}
      />

      <Dialog open={optimizeInfoOpen} onOpenChange={setOptimizeInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Optimize is not implemented yet</DialogTitle>
            <DialogDescription>
              Resume optimization flow is planned, but not available in this
              build yet.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={editInfoOpen} onOpenChange={setEditInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit is not implemented yet</DialogTitle>
            <DialogDescription>
              Direct resume editing from this list will be added in a future
              update.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
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
        <div
          className={cn(
            "fixed right-6 bottom-6 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs text-red-200",
          )}
        >
          {deleteError}
        </div>
      ) : null}
    </div>
  );
}


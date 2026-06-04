"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  FileText,
  Target,
  ArrowRight,
  Layers,
  Sliders,
  Loader2,
} from "lucide-react";

import type { ResumeContent } from "../resume-content-types";
import { buildPdfPayload } from "../resume-content-types";
import type { EditorTabId } from "../editor-tabs";
import { cn } from "~/lib/utils";
import {
  listOptimizationsAction,
  type OptimizationListItem,
} from "~/server/actions/optimizer/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface FinishTabProps {
  content: ResumeContent;
  resumeId: string;
  onTabChange?: (tab: EditorTabId) => void;
  onBrowseTemplates?: () => void;
}

export function FinishTab({
  content,
  resumeId,
  onTabChange,
  onBrowseTemplates,
}: FinishTabProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [optimizations, setOptimizations] = useState<OptimizationListItem[]>(
    [],
  );
  const [isLoadingOpts, setIsLoadingOpts] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      setIsLoadingOpts(true);
      listOptimizationsAction(resumeId)
        .then((list) => {
          setOptimizations(list);
        })
        .catch((err) => {
          console.error("Failed to fetch optimizations in FinishTab:", err);
        })
        .finally(() => {
          setIsLoadingOpts(false);
        });
    }
  }, [isDialogOpen, resumeId]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const payload = buildPdfPayload(content);
      const res = await fetch("/api/pdf-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setDownloadError("PDF generation failed. Try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Download failed. Check your connection.");
    } finally {
      setIsDownloading(false);
    }
  };

  const actions = [
    {
      icon: <Target className="size-4" />,
      label: "Tailor to a specific role",
      description: "Optimise your resume for a target job",
      onClick: () => onTabChange?.("job-tailoring"),
      disabled: false,
    },
    {
      icon: <FileText className="size-4" />,
      label: "Write cover letter",
      description: "Generate a cover letter with this resume linked",
      onClick: () => setIsDialogOpen(true),
      disabled: false,
      pending: false,
    },
    {
      icon: <Layers className="size-4" />,
      label: "Browse our templates",
      description: "Choose a different design or layout template",
      onClick: onBrowseTemplates,
      disabled: false,
    },
    {
      icon: <Sliders className="size-4" />,
      label: "Adjust sections",
      description: "Show or hide sections and customize PDF section headings",
      onClick: () => onTabChange?.("sections"),
      disabled: false,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3.5 text-left transition-all hover:border-violet-400/40 hover:bg-violet-500/15 disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
            <Download className="size-4" strokeWidth={1.7} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Download PDF</p>
            <p className="text-xs text-neutral-500">
              {isDownloading ? "Generating…" : "Save your resume as a PDF file"}
            </p>
          </div>
        </div>
        <ArrowRight className="size-4 text-violet-400" />
      </button>

      {downloadError && <p className="text-xs text-red-400">{downloadError}</p>}

      <div className="h-px bg-white/6" />

      <p className="text-[11px] font-semibold tracking-widest text-neutral-600 uppercase">
        Continue editing
      </p>

      {actions.map((item, idx) => (
        <button
          key={idx}
          type="button"
          disabled={item.disabled}
          onClick={"onClick" in item ? item.onClick : undefined}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all",
            item.disabled
              ? "pointer-events-none cursor-default border-white/6 bg-white/2 opacity-50"
              : "cursor-pointer border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-neutral-400">
              {item.icon}
            </span>
            <div>
              <div className="text-sm font-medium text-neutral-200">
                {item.label}
              </div>
              <p className="text-xs text-neutral-500">
                {"pending" in item && item.pending
                  ? "Running test…"
                  : item.description}
              </p>
            </div>
          </div>
          <ArrowRight className="size-4 text-neutral-500" />
        </button>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border-white/10 bg-neutral-950 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              Generate Cover Letter
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed text-neutral-400">
              Cover letters are tailored to specific roles using your resume
              optimization reports. Select a previous optimization run below to
              continue, or optimize your resume for a new job.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
              Select Optimization Run
            </h4>

            {isLoadingOpts ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-neutral-500">
                <Loader2 className="size-4 animate-spin text-violet-500" />
                Loading optimizations...
              </div>
            ) : optimizations.length === 0 ? (
              <div className="rounded-lg border border-white/6 bg-white/2 p-4 text-center text-xs text-neutral-500 italic">
                No active optimization runs found.
              </div>
            ) : (
              <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
                {optimizations.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setIsDialogOpen(false);
                      router.push(
                        `/dashboard/resumes/${resumeId}/cover-letter?optimisationId=${opt.id}`,
                      );
                    }}
                    className="flex w-full cursor-pointer flex-col items-start gap-1 rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-left transition-all hover:border-violet-500/30 hover:bg-white/4"
                  >
                    <span className="w-full truncate text-sm font-semibold text-white hover:text-violet-300">
                      {opt.jobTitle}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {opt.companyName && opt.companyName !== "Unknown Company"
                        ? `${opt.companyName} • `
                        : ""}
                      {new Date(opt.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-white/6" />

          <div className="flex flex-col gap-2 pt-2">
            <p className="text-xs text-neutral-400">
              Want to target a new role?
            </p>
            <button
              type="button"
              onClick={() => {
                setIsDialogOpen(false);
                onTabChange?.("job-tailoring");
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-600/10 px-4 py-2.5 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-600/20"
            >
              <Target className="size-3.5" />
              Optimize Resume for New Job
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  Download,
  FileText,
  Target,
  ArrowRight,
  Layers,
  Sliders,
} from "lucide-react";

import {
  testCoverLetterAction,
  type TestCoverLetterResult,
} from "~/server/actions/optimizer/test/cover-letter";
import type { ResumeContent } from "../resume-content-types";
import { buildPdfPayload } from "../resume-content-types";
import type { EditorTabId } from "../editor-tabs";
import { cn } from "~/lib/utils";

interface FinishTabProps {
  content: ResumeContent;
  resumeId: string;
  onTabChange?: (tab: EditorTabId) => void;
  onBrowseTemplates?: () => void;
}

function appendLogPath(parts: string[], logPath?: string | null): string {
  if (logPath) {
    parts.push(`Log: ${logPath}`);
  }
  return parts.join("\n\n");
}

function formatCoverLetterResult(result: TestCoverLetterResult): string {
  if (result.ok && result.outcome === "no_optimisation_in_db") {
    return appendLogPath([`OK (expected): ${result.message}`], result.logPath);
  }
  if (result.ok) {
    return appendLogPath(
      [
        `OK: cover letter for optimisation ${result.optimisationId}`,
        result.coverLetterPreview,
      ],
      result.logPath,
    );
  }
  return appendLogPath([`[${result.kind}] ${result.error}`], result.logPath);
}

export function FinishTab({
  content,
  resumeId,
  onTabChange,
  onBrowseTemplates,
}: FinishTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isCoverLetterPending, startCoverLetter] = useTransition();

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

  // Dedicated cover letter generation and download (kept intact in code, but button is disabled in UI)
  const handleCoverLetterTest = () => {
    setTestStatus(null);
    startCoverLetter(async () => {
      const result = await testCoverLetterAction(resumeId);
      setTestStatus(formatCoverLetterResult(result));

      if (
        result.ok &&
        result.outcome === "cover_letter_generated" &&
        result.coverLetterText
      ) {
        try {
          const blob = new Blob([result.coverLetterText], {
            type: "text/plain;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "cover-letter.txt";
          a.click();
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error("Failed to download cover letter:", e);
        }
      }
    });
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
      label: (
        <span className="flex items-center gap-1.5 font-medium text-neutral-200">
          Write cover letter
          <span className="rounded-full border border-neutral-700 bg-neutral-800/50 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-400">
            soon
          </span>
        </span>
      ),
      description: "Generate a cover letter with this resume linked",
      onClick: handleCoverLetterTest,
      disabled: true,
      pending: isCoverLetterPending,
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

      {testStatus ? (
        <pre className="rounded-lg border border-white/8 bg-black/30 p-3 text-xs whitespace-pre-wrap text-neutral-300">
          {testStatus}
        </pre>
      ) : null}
    </div>
  );
}

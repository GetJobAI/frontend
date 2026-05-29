"use client";

import { useState, useTransition } from "react";
import { Download, Sparkles, FileText, Target, ArrowRight } from "lucide-react";

import {
  testCoverLetterAction,
  type TestCoverLetterResult,
} from "~/server/actions/optimizer/test/cover-letter";
import {
  testOptimizerAction,
  type TestOptimizerResult,
} from "~/server/actions/optimizer/test/optimize";
import type { ResumeContent } from "../resume-content-types";
import { buildPdfPayload } from "../resume-content-types";

interface FinishTabProps {
  content: ResumeContent;
  resumeId: string;
}

function appendLogPath(parts: string[], logPath?: string | null): string {
  if (logPath) {
    parts.push(`Log: ${logPath}`);
  }
  return parts.join("\n\n");
}

function formatOptimizerResult(result: TestOptimizerResult): string {
  if (result.ok) {
    const parts = [`OK: optimisation ${result.optimisationId}`];
    if (result.coverLetterPreview) {
      parts.push(result.coverLetterPreview);
    }
    return appendLogPath(parts, result.logPath);
  }
  return appendLogPath([`[${result.kind}] ${result.error}`], result.logPath);
}

function formatCoverLetterResult(result: TestCoverLetterResult): string {
  if (result.ok && result.outcome === "no_optimisation_in_db") {
    return appendLogPath(
      [`OK (expected): ${result.message}`],
      result.logPath,
    );
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

export function FinishTab({ content, resumeId }: FinishTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isOptimizePending, startOptimize] = useTransition();
  const [isCoverLetterPending, startCoverLetter] = useTransition();
  const isTestPending = isOptimizePending || isCoverLetterPending;

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

  const handleOptimizeTest = () => {
    setTestStatus(null);
    startOptimize(async () => {
      const result = await testOptimizerAction(resumeId);
      setTestStatus(formatOptimizerResult(result));
    });
  };

  const handleCoverLetterTest = () => {
    setTestStatus(null);
    startCoverLetter(async () => {
      const result = await testCoverLetterAction(resumeId);
      setTestStatus(formatCoverLetterResult(result));
    });
  };

  const actions = [
    {
      icon: <Target className="size-4" />,
      label: "Tailor to a specific role",
      description: isOptimizePending
        ? "Running pipeline test (up to ~30s)…"
        : "Optimise your resume for a target job",
      onClick: handleOptimizeTest,
      pending: isOptimizePending,
    },
    {
      icon: <FileText className="size-4" />,
      label: "Write cover letter",
      description: "Generate a cover letter with this resume linked",
      onClick: handleCoverLetterTest,
      pending: isCoverLetterPending,
    },
    {
      icon: <Sparkles className="size-4" />,
      label: "Refine with AI",
      description: "Chat with an AI assistant to improve your resume",
      disabled: true,
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

      {actions.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled={
            "disabled" in item && item.disabled
              ? true
              : isTestPending
          }
          onClick={"onClick" in item ? item.onClick : undefined}
          className="flex w-full items-center justify-between rounded-xl border border-white/6 bg-white/2 px-4 py-3.5 text-left transition-all hover:border-white/12 hover:bg-white/4 disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-neutral-400">
              {item.icon}
            </span>
            <div>
              <p className="text-sm font-medium text-neutral-200">
                {item.label}
              </p>
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
        <pre className="whitespace-pre-wrap rounded-lg border border-white/8 bg-black/30 p-3 text-xs text-neutral-300">
          {testStatus}
        </pre>
      ) : null}
    </div>
  );
}

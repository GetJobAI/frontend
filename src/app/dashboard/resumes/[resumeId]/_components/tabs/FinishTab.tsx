"use client";

import { Download, Sparkles, FileText, Target, ArrowRight } from "lucide-react";
import type { ResumeContent } from "../resume-content-types";
import { buildPdfPayload } from "../resume-content-types";
import { useState } from "react";

interface FinishTabProps {
  content: ResumeContent;
  resumeId: string;
}

export function FinishTab({ content, resumeId: _resumeId }: FinishTabProps) {
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

  const comingSoon = [
    {
      icon: <Target className="size-4" />,
      label: "Tailor to a specific role",
      description: "Optimise your resume for a target job",
    },
    {
      icon: <FileText className="size-4" />,
      label: "Write cover letter",
      description: "Generate a cover letter with this resume linked",
    },
    {
      icon: <Sparkles className="size-4" />,
      label: "Refine with AI",
      description: "Chat with an AI assistant to improve your resume",
    },
  ];

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

      {comingSoon.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled
          className="flex w-full items-center justify-between rounded-xl border border-white/6 bg-white/2 px-4 py-3.5 text-left opacity-50"
          title="Coming soon"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-neutral-500">
              {item.icon}
            </span>
            <div>
              <p className="text-sm font-medium text-neutral-300">
                {item.label}
              </p>
              <p className="text-xs text-neutral-600">{item.description}</p>
            </div>
          </div>
          <span className="rounded-full border border-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-600">
            soon
          </span>
        </button>
      ))}
    </div>
  );
}

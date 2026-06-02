"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { testOptimizerAction } from "~/server/actions/optimizer/test/optimize";
import { ARTIFICIAL_JOB_POSTING_RAW_TEXT } from "~/server/actions/optimizer/test/fixtures";
import { buildPdfPayload } from "../resume-content-types";

interface JobTailoringTabProps {
  resumeId: string;
}

function appendLogPath(parts: string[], logPath?: string | null): string {
  if (logPath) {
    parts.push(`Log: ${logPath}`);
  }
  return parts.join("\n\n");
}

export function JobTailoringTab({ resumeId }: JobTailoringTabProps) {
  const [jobDescription, setJobDescription] = useState(ARTIFICIAL_JOB_POSTING_RAW_TEXT);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isOptimizePending, startOptimize] = useTransition();

  const handleOptimize = () => {
    setTestStatus(null);
    startOptimize(async () => {
      const result = await testOptimizerAction(resumeId, jobDescription);
      
      if (result.ok) {
        setTestStatus(appendLogPath([`OK: optimisation ${result.optimisationId}`], result.logPath));
        if (result.optimizedResumePayload) {
          try {
            const payload = buildPdfPayload(result.optimizedResumePayload);
            const res = await fetch("/api/pdf-preview", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "optimized-resume.pdf";
              a.click();
              URL.revokeObjectURL(url);
            }
          } catch (e) {
            console.error("Failed to generate and download optimized PDF:", e);
          }
        }
      } else {
        setTestStatus(appendLogPath([`[${result.kind}] ${result.error}`], result.logPath));
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-400">
          Job description text
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here…"
          rows={12}
          className="w-full resize-none rounded-lg border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-white transition-all placeholder:text-neutral-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleOptimize}
        disabled={isOptimizePending || !jobDescription.trim()}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition-all hover:border-violet-400/40 hover:bg-violet-500/15 disabled:cursor-default disabled:opacity-50 disabled:hover:border-violet-500/25 disabled:hover:bg-violet-500/10"
      >
        {isOptimizePending ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <Sparkles className="size-4" strokeWidth={1.7} />
        )}
        {isOptimizePending ? "Tailoring to role…" : "Optimize with AI"}
      </button>

      {testStatus ? (
        <pre className="whitespace-pre-wrap rounded-lg border border-white/8 bg-black/30 p-3 text-xs text-neutral-300">
          {testStatus}
        </pre>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export function JobTailoringTab() {
  const [jobDescription, setJobDescription] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here…"
        rows={10}
        className="w-full resize-none rounded-lg border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-white transition-all placeholder:text-neutral-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none"
      />

      <button
        type="button"
        disabled
        className="flex items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/4 px-4 py-2.5 text-sm font-medium text-neutral-500"
        title="Coming soon"
      >
        <Sparkles className="size-4" strokeWidth={1.7} />
        Optimize with AI
        <span className="ml-1 rounded-full border border-neutral-700 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
          soon
        </span>
      </button>

      <div className="rounded-lg border border-dashed border-white/6 p-4">
        <p className="text-xs font-medium text-neutral-500">
          Other AI features — coming soon
        </p>
        <ul className="mt-2 space-y-1">
          {[
            "Generate Cover Letter",
            "Keyword Match Analysis",
            "ATS Score Check",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-[11px] text-neutral-700"
            >
              <span className="size-1 rounded-full bg-neutral-700" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

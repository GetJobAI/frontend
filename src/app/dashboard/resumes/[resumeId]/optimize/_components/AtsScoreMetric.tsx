"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";

interface AtsScoreMetricProps {
  originalScore: number;
  liveScore: number;
}

export function AtsScoreMetric({
  originalScore,
  liveScore,
}: AtsScoreMetricProps) {
  // Use state to trigger nice entry animations
  const [animatedOrig, setAnimatedOrig] = useState(0);
  const [animatedLive, setAnimatedLive] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedOrig(originalScore);
      setAnimatedLive(liveScore);
    }, 100);
    return () => clearTimeout(timer);
  }, [originalScore, liveScore]);

  // SVG circular dial parameters
  const radiusOrig = 26;
  const circOrig = 2 * Math.PI * radiusOrig;

  const radiusLive = 33;
  const circLive = 2 * Math.PI * radiusLive;

  const getStrokeOffsetOrig = (score: number) => {
    const clamped = Math.min(Math.max(score, 0), 100);
    return circOrig - (clamped / 100) * circOrig;
  };

  const getStrokeOffsetLive = (score: number) => {
    const clamped = Math.min(Math.max(score, 0), 100);
    return circLive - (clamped / 100) * circLive;
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/4 p-4 backdrop-blur-md">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-violet-400 uppercase">
          <Sparkles className="size-3.5" />
          ATS Score Impact
        </div>
        <p className="text-sm font-medium text-neutral-200">
          Tailoring Progress
        </p>
        <p className="max-w-[12rem] text-[11px] leading-relaxed text-neutral-500">
          Accept suggestions to incorporate missing keywords and lift your ATS
          compatibility.
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <div className="relative size-16">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="size-full -rotate-90"
            >
              <circle
                cx="32"
                cy="32"
                r={radiusOrig}
                className="fill-none stroke-white/4"
                strokeWidth="4"
              />

              <circle
                cx="32"
                cy="32"
                r={radiusOrig}
                className="fill-none stroke-neutral-500 transition-all duration-700 ease-out"
                strokeWidth="4"
                strokeDasharray={circOrig}
                strokeDashoffset={getStrokeOffsetOrig(animatedOrig)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-neutral-400 tabular-nums">
                {originalScore}
              </span>
              <span className="text-[8px] leading-none text-neutral-500">
                Before
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="relative size-20">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              className="size-full -rotate-90"
            >
              <circle
                cx="40"
                cy="40"
                r={radiusLive}
                className="fill-none stroke-white/4"
                strokeWidth="5"
              />

              <circle
                cx="40"
                cy="40"
                r={radiusLive}
                className={cn(
                  "fill-none transition-all duration-700 ease-out",
                  liveScore >= 80
                    ? "stroke-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                    : "stroke-violet-500 drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]",
                )}
                strokeWidth="5"
                strokeDasharray={circLive}
                strokeDashoffset={getStrokeOffsetLive(animatedLive)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg leading-none font-extrabold text-white tabular-nums">
                {liveScore}
              </span>
              <span className="text-[9px] font-medium text-neutral-400">
                Live
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

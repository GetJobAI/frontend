"use client";

import { cn } from "~/lib/utils";
import { Check, CircleX } from "lucide-react";
import { STEP_META, TOTAL_STEPS } from "~/lib/wizard-schemas";
import { useWizard } from "./WizardContext";
import { getStepStatus } from "~/lib/completeness";

export function WizardProgress() {
  const { currentStep, furthestStep, goToStep, stepData } = useWizard();

  const row1 = STEP_META.slice(0, 5);
  const row2 = STEP_META.slice(5, 9);

  const renderRow = (items: Array<{ step: number; label: string }>) => (
    <div className="flex w-full divide-x divide-white/10 overflow-hidden rounded-lg border border-white/10">
      {items.map(({ step, label }) => {
        const isClickable = step <= furthestStep;
        const status = getStepStatus(step, stepData);
        const isDone = status.filled && step !== currentStep;
        const isUndone = !status.filled && step !== currentStep && isClickable;
        const isCurrent = step === currentStep;

        return (
          <button
            key={step}
            type="button"
            onClick={() => isClickable && goToStep(step)}
            disabled={!isClickable}
            title={label}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1.5 px-1 py-2 transition-all",
              isClickable ? "cursor-pointer" : "",
              isCurrent
                ? "bg-violet-500/15 text-violet-300"
                : isDone
                  ? "bg-white/5 text-neutral-300 hover:bg-white/10"
                  : isUndone
                    ? "bg-white/3 text-neutral-400 hover:bg-white/8"
                    : "bg-transparent text-neutral-600",
            )}
          >
            {isDone ? (
              <Check className="size-4 text-violet-400" strokeWidth={2.5} />
            ) : isUndone ? (
              <CircleX
                className={cn(
                  "size-4",
                  status.required ? "text-red-500/60" : "text-neutral-500",
                )}
                strokeWidth={2.2}
              />
            ) : (
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[10px] leading-none font-bold",
                  isCurrent
                    ? "bg-violet-500/30 text-violet-300"
                    : "bg-white/10 text-neutral-500",
                )}
              >
                {step}
              </span>
            )}
            <span className="w-full truncate text-center text-[10px] font-medium tracking-tight sm:text-[11px]">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/6">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-violet-500 transition-all duration-500 ease-out"
            style={{
              width: `${((furthestStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
            }}
          />
        </div>
        <span className="shrink-0 text-[10px] font-medium text-neutral-500 tabular-nums">
          {furthestStep}/{TOTAL_STEPS}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {renderRow(row1)}
        {renderRow(row2)}
      </div>
    </div>
  );
}

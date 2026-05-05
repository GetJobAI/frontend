"use client";

import { cn } from "~/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useWizard } from "./WizardContext";

interface WizardNavProps {
  onNext?: () => void | Promise<void>;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  canNext?: boolean;
  className?: string;
}

export function WizardNavButtons({
  onNext,
  isSubmitting = false,
  isLastStep = false,
  canNext = true,
  className,
}: WizardNavProps) {
  const { prevStep, currentStep } = useWizard();

  return (
    <div
      className={cn("flex items-center justify-between gap-3 pt-2", className)}
    >
      <button
        type="button"
        onClick={prevStep}
        disabled={currentStep === 1}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-4 py-2 text-sm font-medium text-neutral-400 transition-all",
          "hover:border-white/14 hover:bg-white/6 hover:text-white",
          "disabled:cursor-not-allowed disabled:opacity-30",
        )}
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        Back
      </button>

      <button
        type={onNext ? "button" : "submit"}
        onClick={onNext}
        disabled={!canNext || isSubmitting}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-all",
          "hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-violet-600 disabled:hover:shadow-none",
          "active:scale-[0.98] disabled:active:scale-100",
        )}
      >
        {isSubmitting ? (
          <>
            <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {isLastStep ? "Finalizing…" : "Saving…"}
          </>
        ) : isLastStep ? (
          <>
            <Check className="size-3.5" strokeWidth={2.5} />
            Finalize resume
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </>
        )}
      </button>
    </div>
  );
}

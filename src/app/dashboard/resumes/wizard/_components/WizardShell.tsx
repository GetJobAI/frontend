"use client";

import { WizardProvider, useWizard } from "./WizardContext";
import { WizardClearSessionButton } from "./WizardClearSessionButton";
import { WizardProgress } from "./WizardProgress";
import { Step1PersonalInfo } from "./Step1PersonalInfo";
import { Step2Summary } from "./Step2Summary";
import { Step3Experience } from "./Step3Experience";
import { Step4Education } from "./Step4Education";
import { Step5Skills } from "./Step5Skills";
import { Step6Certifications } from "./Step6Certifications";
import { Step7Languages } from "./Step7Languages";
import { Step8Projects } from "./Step8Projects";
import { Step9Review } from "./Step9Review";
import { STEP_META } from "../lib/wizard-schemas";
import { WandSparkles } from "lucide-react";

function WizardBody() {
  const { currentStep, formResetKey, isLoading, loadError, retryBootstrap } =
    useWizard();

  if (isLoading) {
    return (
      <div className="-m-6 flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 bg-black sm:-m-8">
        <div className="size-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
        <p className="text-xs text-neutral-600">Loading your session…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
        <p className="max-w-sm text-center text-xs text-red-400">{loadError}</p>
        <button
          type="button"
          onClick={() => void retryBootstrap()}
          className="cursor-pointer rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-violet-500/40 hover:text-violet-300"
        >
          Retry loading session
        </button>
      </div>
    );
  }

  const meta = STEP_META.find((s) => s.step === currentStep);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
            Step {currentStep} of 9
          </p>
          <h1 className="text-xl font-semibold text-white">
            {meta?.label ?? ""}
          </h1>
          {meta?.description && (
            <p className="text-xs text-neutral-500">{meta.description}</p>
          )}
        </div>
      </div>

      <WizardProgress />

      <div className="h-px bg-white/6" />

      <div className="min-h-[280px]">
        {currentStep === 1 && <Step1PersonalInfo key={formResetKey} />}
        {currentStep === 2 && <Step2Summary key={formResetKey} />}
        {currentStep === 3 && <Step3Experience key={formResetKey} />}
        {currentStep === 4 && <Step4Education key={formResetKey} />}
        {currentStep === 5 && <Step5Skills key={formResetKey} />}
        {currentStep === 6 && <Step6Certifications key={formResetKey} />}
        {currentStep === 7 && <Step7Languages key={formResetKey} />}
        {currentStep === 8 && <Step8Projects key={formResetKey} />}
        {currentStep === 9 && <Step9Review key={formResetKey} />}
      </div>
    </div>
  );
}

function WizardChrome() {
  const { isLoading, loadError } = useWizard();
  const showClear = !isLoading && !loadError;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 pb-16">
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/15 text-violet-400">
            <WandSparkles className="size-4" strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white">Resume Wizard</h1>
            <p className="text-[11px] text-neutral-600">
              Progress auto-saves every 500 ms — pick up right where you left
              off
            </p>
          </div>
        </div>
        {showClear ? <WizardClearSessionButton /> : null}
      </div>

      <div className="card-surface flex flex-col gap-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <WizardBody />
        </div>
      </div>
    </div>
  );
}

export function WizardShell() {
  return (
    <WizardProvider>
      <WizardChrome />
    </WizardProvider>
  );
}

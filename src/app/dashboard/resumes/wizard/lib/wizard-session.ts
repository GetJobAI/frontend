import { stepIsFilled } from "./completeness";

const PROGRESS_STEPS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** True when the user has saved meaningful wizard data (not a freshly opened session). */
export function hasWizardSessionProgress(
  stepData: Record<string, unknown>,
): boolean {
  return PROGRESS_STEPS.some((step) =>
    stepIsFilled(
      step,
      (stepData[step] as Record<string, unknown> | undefined) ?? {},
    ),
  );
}

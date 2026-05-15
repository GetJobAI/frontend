import { SUMMARY_MIN_LENGTH } from "./wizard-schemas";

const WEIGHTS: Record<number, number> = {
  1: 15, // Contact + style
  2: 15, // Summary
  3: 30, // Work experience (heaviest — most ATS impact)
  4: 15, // Education
  5: 15, // Skills
  6: 5, // Certifications (optional)
  7: 5, // Languages (optional)
  8: 0, // Projects — not scored (fully optional, no penalty)
};

const REQUIRED_STEPS = new Set([1, 2, 3, 4, 5]);

function getDataForStep(
  stepData: Record<string, unknown>,
  step: number,
): Record<string, unknown> {
  return (stepData[step] as Record<string, unknown> | undefined) ?? {};
}

export function stepIsFilled(
  step: number,
  data: Record<string, unknown>,
): boolean {
  if (!data) return false;
  switch (step) {
    case 1:
      if (!data.contact || typeof data.contact !== "object") return false;
      const contact = data.contact as { name?: unknown; email?: unknown };
      const name = contact.name;
      const email = contact.email;
      return !!(
        typeof name === "string" &&
        name.trim().length > 0 &&
        typeof email === "string" &&
        email.trim().length > 0
      );
    case 2:
      return !!(
        typeof data.summary === "string" &&
        data.summary.trim().length >= SUMMARY_MIN_LENGTH
      );
    case 3:
      return Array.isArray(data.experience) && data.experience.length > 0;
    case 4:
      return Array.isArray(data.education) && data.education.length > 0;
    case 5:
      return Array.isArray(data.skills) && data.skills.length > 0;
    case 6:
      return (
        Array.isArray(data.certifications) && data.certifications.length > 0
      );
    case 7:
      return Array.isArray(data.languages) && data.languages.length > 0;
    case 8:
      return Array.isArray(data.projects) && data.projects.length > 0;
    case 9:
      return false;
    default:
      return true;
  }
}

export function getStepStatus(step: number, stepData: Record<string, unknown>) {
  const data = getDataForStep(stepData, step);
  const filled = stepIsFilled(step, data);
  const required = REQUIRED_STEPS.has(step);

  if (filled) {
    return { filled: true, required, reason: null as string | null };
  }

  const reason = (() => {
    switch (step) {
      case 1:
        return "Add your name and email in contact details.";
      case 2:
        return `Add at least ${SUMMARY_MIN_LENGTH} characters in your summary.`;
      case 3:
        return "Add at least one experience entry.";
      case 4:
        return "Add at least one education entry.";
      case 5:
        return "Add at least one skill group.";
      default:
        return "Optional section not filled yet.";
    }
  })();

  return { filled: false, required, reason };
}

export function computeCompletenessScore(
  stepData: Record<string, unknown>,
): number {
  return Object.entries(WEIGHTS).reduce((total, [step, weight]) => {
    const data = getDataForStep(stepData, Number(step));
    return total + (stepIsFilled(Number(step), data) ? weight : 0);
  }, 0);
}

export function getMissingRequiredSteps(
  stepData: Record<string, unknown>,
): number[] {
  return Array.from(REQUIRED_STEPS).filter((step) => {
    const data = getDataForStep(stepData, step);
    return !stepIsFilled(step, data);
  });
}

export function areRequiredStepsComplete(
  stepData: Record<string, unknown>,
): boolean {
  return getMissingRequiredSteps(stepData).length === 0;
}

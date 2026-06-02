import { apiNext } from "~/lib/api-next";

export const wizardKeys = {
  all: ["wizard"] as const,
  sessions: () => [...wizardKeys.all, "session"] as const,
  session: (id: string) => [...wizardKeys.sessions(), id] as const,
};

export type WizardSession = {
  sessionId: string;
  currentStep: number;
  stepData: Record<string, unknown>;
  source?: string;
};

export async function fetchWizardSession(
  sessionId: string,
): Promise<WizardSession> {
  const { data } = await apiNext.get<WizardSession>(`/wizard/${sessionId}`);
  return data;
}

export async function createWizardSession(): Promise<{
  sessionId: string;
  currentStep: number;
}> {
  const { data } = await apiNext.post<{
    sessionId: string;
    currentStep: number;
  }>("/wizard");
  return data;
}

export async function clearWizardSession(sessionId: string): Promise<void> {
  await apiNext.delete(`/wizard/${sessionId}`);
}

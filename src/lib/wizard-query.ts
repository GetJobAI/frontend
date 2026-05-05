import { apiClient } from "~/lib/api-client";

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
  const { data } = await apiClient.get<WizardSession>(`/wizard/${sessionId}`);
  return data;
}

export async function createWizardSession(): Promise<{
  sessionId: string;
  currentStep: number;
}> {
  const { data } = await apiClient.post<{
    sessionId: string;
    currentStep: number;
  }>("/wizard");
  return data;
}

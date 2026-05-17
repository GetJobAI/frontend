export type FinalizeWizardActionResult =
  | {
      ok: true;
      resumeId: string;
      score?: number;
      idempotent?: boolean;
    }
  | {
      ok: false;
      error: string;
      status?: number;
      score?: number;
    };

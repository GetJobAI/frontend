"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";

import { getUserId } from "~/lib/auth";
import {
  areRequiredStepsComplete,
  computeCompletenessScore,
} from "~/app/dashboard/resumes/wizard/lib/completeness";
import {
  decryptStepData,
  StepDataDecryptError,
} from "~/app/dashboard/resumes/wizard/lib/crypto";
import { assembleResumeJson } from "~/app/dashboard/resumes/wizard/lib/assemble-resume";
import { WIZARD_SESSION_CONTENT_KEY } from "~/app/dashboard/resumes/wizard/lib/resume-constants";
import {
  getResumes,
  postResumes,
} from "~/server/api/generated/resumes/resumes";
import type { GetResumesParams, Resumes } from "~/server/api/generated/schemas";
import { db } from "~/server/db";
import { wizardSessions } from "~/server/db/schema";
import type { FinalizeWizardActionResult } from "./types";

async function findResumeByWizardSession(
  userId: string,
  sessionId: string,
): Promise<Resumes | null> {
  const params: GetResumesParams & Record<string, string> = {
    user_id: `eq.${userId}`,
    limit: "1",
  };
  params[`content->>${WIZARD_SESSION_CONTENT_KEY}`] = `eq.${sessionId}`;

  const rows = await getResumes(params);
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  return rows[0] ?? null;
}

export async function finalizeWizardAction(
  sessionId: string,
): Promise<FinalizeWizardActionResult> {
  try {
    const userId = await getUserId();

    const existingRemote = await findResumeByWizardSession(userId, sessionId);
    if (existingRemote) {
      return { ok: true, resumeId: existingRemote.id, idempotent: true };
    }

    const session = await db.query.wizardSessions.findFirst({
      where: and(
        eq(wizardSessions.id, sessionId),
        eq(wizardSessions.userId, userId),
        isNull(wizardSessions.completedAt),
      ),
    });

    if (!session) {
      const afterRace = await findResumeByWizardSession(userId, sessionId);
      if (afterRace) {
        return { ok: true, resumeId: afterRace.id, idempotent: true };
      }
      return { ok: false, error: "Not found", status: 404 };
    }

    const stepData = decryptStepData(session.stepData);
    const score = computeCompletenessScore(stepData);
    const requiredStepsComplete = areRequiredStepsComplete(stepData);

    if (!requiredStepsComplete) {
      return {
        ok: false,
        error: "Required wizard sections are incomplete",
        status: 422,
        score,
      };
    }

    if (score < 60) {
      return {
        ok: false,
        error: "Completeness score below 60%",
        status: 422,
        score,
      };
    }

    const resumeJson = {
      ...assembleResumeJson(stepData),
      [WIZARD_SESSION_CONTENT_KEY]: sessionId,
    };

    await postResumes(undefined, {
      data: {
        user_id: userId,
        content: resumeJson,
      },
      headers: {
        Prefer: "return=representation",
      },
      validateStatus: (s) => s === 201 || s === 200,
    });

    const created = await findResumeByWizardSession(userId, sessionId);
    if (!created) {
      throw new Error("Created resume was not returned by backend");
    }

    await db
      .delete(wizardSessions)
      .where(
        and(
          eq(wizardSessions.id, session.id),
          eq(wizardSessions.userId, userId),
        ),
      );

    revalidatePath("/dashboard/resumes");
    return { ok: true, resumeId: created.id, score };
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return { ok: false, error: "Unauthorized", status: 401 };
    }
    if (e instanceof StepDataDecryptError) {
      console.error("[finalizeWizardAction] decrypt failed", e);
      return {
        ok: false,
        error: "Session data is corrupted and cannot be read",
        status: 500,
      };
    }
    console.error("[finalizeWizardAction]", e);
    return { ok: false, error: "Internal server error", status: 500 };
  }
}

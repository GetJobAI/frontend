import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { wizardSessions } from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getUserId } from "~/lib/auth";
import { decryptStepData, StepDataDecryptError } from "~/lib/crypto";
import { assembleResumeJson } from "~/lib/assemble-resume";
import {
  areRequiredStepsComplete,
  computeCompletenessScore,
} from "~/lib/completeness";
import { WIZARD_SESSION_CONTENT_KEY } from "~/lib/resume-constants";
import {
  createResumeOnBackend,
  findResumeByWizardSessionFromBackend,
} from "~/server/actions/backend/resumes-api";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getUserId();
    const { sessionId } = await params;

    const existingRemote = await findResumeByWizardSessionFromBackend(
      userId,
      sessionId,
    );
    if (existingRemote) {
      return NextResponse.json({
        resumeId: existingRemote.id,
        idempotent: true,
      });
    }

    const session = await db.query.wizardSessions.findFirst({
      where: and(
        eq(wizardSessions.id, sessionId),
        eq(wizardSessions.userId, userId),
        isNull(wizardSessions.completedAt),
      ),
    });

    if (!session) {
      const afterRace = await findResumeByWizardSessionFromBackend(
        userId,
        sessionId,
      );
      if (afterRace) {
        return NextResponse.json({
          resumeId: afterRace.id,
          idempotent: true,
        });
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const stepData = decryptStepData(session.stepData);

    const score = computeCompletenessScore(stepData);
    const requiredStepsComplete = areRequiredStepsComplete(stepData);

    if (!requiredStepsComplete) {
      return NextResponse.json(
        { error: "Required wizard sections are incomplete", score },
        { status: 422 },
      );
    }

    if (score < 60) {
      return NextResponse.json(
        { error: "Completeness score below 60%", score },
        { status: 422 },
      );
    }

    const resumeJson = {
      ...assembleResumeJson(stepData),
      [WIZARD_SESSION_CONTENT_KEY]: sessionId,
    };

    const { id: resumeId } = await createResumeOnBackend({
      userId,
      content: resumeJson,
    });

    await db
      .delete(wizardSessions)
      .where(
        and(
          eq(wizardSessions.id, session.id),
          eq(wizardSessions.userId, userId),
        ),
      );

    return NextResponse.json({ resumeId, score });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof StepDataDecryptError) {
      console.error("[wizard/finalize/POST] decrypt failed", e);
      return NextResponse.json(
        { error: "Session data is corrupted and cannot be read" },
        { status: 500 },
      );
    }
    console.error("[wizard/finalize/POST]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

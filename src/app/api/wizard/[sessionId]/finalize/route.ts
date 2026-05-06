import { db } from "~/server/db";
import { wizardSessions, resumes } from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getUserId } from "~/lib/auth";
import { decryptStepData, StepDataDecryptError } from "~/lib/crypto";
import { assembleResumeJson } from "~/lib/assemble-resume";
import { computeCompletenessScore } from "~/lib/completeness";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getUserId();
    const { sessionId } = await params;

    const existingResume = await db.query.resumes.findFirst({
      where: and(
        eq(resumes.userId, userId),
        eq(resumes.wizardSessionId, sessionId),
      ),
    });
    if (existingResume) {
      return Response.json({ resumeId: existingResume.id, idempotent: true });
    }

    const result = await db.transaction(async (tx) => {
      const session = await tx.query.wizardSessions.findFirst({
        where: and(
          eq(wizardSessions.id, sessionId),
          eq(wizardSessions.userId, userId),
          isNull(wizardSessions.completedAt),
        ),
      });
      if (!session) {
        return null;
      }

      const stepData = decryptStepData(session.stepData);
      const score = computeCompletenessScore(stepData);

      if (score < 60) {
        return { error: "Completeness score below 60%", score } as const;
      }

      const resumeJson = assembleResumeJson(stepData);
      const [resume] = await tx
        .insert(resumes)
        .values({
          userId,
          content: resumeJson,
          inputMethod: "wizard",
          wizardSessionId: session.id,
          parseStatus: "completed",
        })
        .returning({ id: resumes.id });

      await tx
        .delete(wizardSessions)
        .where(
          and(
            eq(wizardSessions.id, session.id),
            eq(wizardSessions.userId, userId),
          ),
        );

      return { resumeId: resume!.id, score } as const;
    });

    if (!result) {
      const resumeAfterRace = await db.query.resumes.findFirst({
        where: and(
          eq(resumes.userId, userId),
          eq(resumes.wizardSessionId, sessionId),
        ),
      });
      if (resumeAfterRace) {
        return Response.json({
          resumeId: resumeAfterRace.id,
          idempotent: true,
        });
      }
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    if ("error" in result) {
      return Response.json(
        { error: result.error, score: result.score },
        { status: 422 },
      );
    }

    return Response.json(result);
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof StepDataDecryptError) {
      console.error("[wizard/finalize/POST] decrypt failed", e);
      return Response.json(
        { error: "Session data is corrupted and cannot be read" },
        { status: 500 },
      );
    }
    console.error("[wizard/finalize/POST]", e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

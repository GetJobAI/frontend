import { db } from "~/server/db";
import { wizardSessions } from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { stepSchemas } from "~/lib/wizard-schemas";
import { getUserId } from "~/lib/auth";
import {
  encryptStepData,
  decryptStepData,
  StepDataDecryptError,
} from "~/lib/crypto";
import { checkRateLimit } from "~/lib/rate-limit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string; step: string }> },
) {
  try {
    const userId = await getUserId();

    if (!checkRateLimit(userId)) {
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { sessionId, step } = await params;
    const stepNum = Number(step) as keyof typeof stepSchemas;
    const body = (await req.json()) as unknown;

    const schema = stepSchemas[stepNum];
    if (!schema) {
      return Response.json({ error: "Invalid step" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const session = await db.query.wizardSessions.findFirst({
      where: and(
        eq(wizardSessions.id, sessionId),
        eq(wizardSessions.userId, userId),
        isNull(wizardSessions.completedAt),
      ),
    });
    if (!session) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const currentData = decryptStepData(session.stepData);
    const updatedData = { ...currentData, [stepNum]: parsed.data };

    const writeResult = await db
      .update(wizardSessions)
      .set({
        stepData: encryptStepData(updatedData),
        currentStep: Math.max(session.currentStep, Math.min(stepNum + 1, 9)),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(wizardSessions.id, sessionId),
          eq(wizardSessions.userId, userId),
          isNull(wizardSessions.completedAt),
        ),
      )
      .returning({ id: wizardSessions.id });

    if (writeResult.length === 0) {
      return Response.json(
        { error: "Session changed, please retry" },
        { status: 409 },
      );
    }

    return Response.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof StepDataDecryptError) {
      console.error("[wizard/steps/PATCH] decrypt failed", e);
      return Response.json(
        { error: "Session data is corrupted and cannot be read" },
        { status: 500 },
      );
    }
    console.error("[wizard/steps/PATCH]", e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

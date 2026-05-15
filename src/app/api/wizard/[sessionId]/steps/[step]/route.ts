import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { wizardSessions } from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { stepSchemas } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import { getUserId } from "~/lib/auth";
import {
  encryptStepData,
  decryptStepData,
  StepDataDecryptError,
} from "~/app/dashboard/resumes/wizard/lib/crypto";
import { checkRateLimit } from "~/app/dashboard/resumes/wizard/lib/rate-limit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string; step: string }> },
) {
  try {
    const userId = await getUserId();

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const { sessionId, step } = await params;
    const stepNum = Number(step) as keyof typeof stepSchemas;
    const body = (await req.json()) as unknown;

    const schema = stepSchemas[stepNum];
    if (!schema) {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const session = await db.query.wizardSessions.findFirst({
      where: and(
        eq(wizardSessions.id, sessionId),
        eq(wizardSessions.userId, userId),
        isNull(wizardSessions.completedAt),
      ),
    });
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "Session changed, please retry" },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof StepDataDecryptError) {
      console.error("[wizard/steps/PATCH] decrypt failed", e);
      return NextResponse.json(
        { error: "Session data is corrupted and cannot be read" },
        { status: 500 },
      );
    }
    console.error("[wizard/steps/PATCH]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { wizardSessions } from "~/server/db/schema";
import { getUserId } from "~/lib/auth";
import {
  decryptStepData,
  encryptStepData,
  StepDataDecryptError,
} from "~/app/dashboard/resumes/wizard/lib/crypto";
import { checkRateLimit } from "~/app/dashboard/resumes/wizard/lib/rate-limit";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getUserId();
    const { sessionId } = await params;

    const session = await db.query.wizardSessions.findFirst({
      where: and(
        eq(wizardSessions.id, sessionId),
        eq(wizardSessions.userId, userId),
        isNull(wizardSessions.completedAt),
      ),
    });
    if (!session) {
      return NextResponse.json(
        { error: "Session not found or already finalized" },
        { status: 404 },
      );
    }

    const stepData = decryptStepData(session.stepData);

    return NextResponse.json({
      sessionId: session.id,
      currentStep: session.currentStep,
      stepData,
      source: session.source,
    });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof StepDataDecryptError) {
      console.error("[wizard/[sessionId]/GET] decrypt failed", e);
      return NextResponse.json(
        { error: "Session data is corrupted and cannot be read" },
        { status: 500 },
      );
    }
    console.error("[wizard/[sessionId]/GET]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const userId = await getUserId();

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const { sessionId } = await params;

    const writeResult = await db
      .update(wizardSessions)
      .set({
        stepData: encryptStepData({}),
        currentStep: 1,
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
        { error: "Session not found or already finalized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[wizard/[sessionId]/DELETE]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

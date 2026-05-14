import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { wizardSessions } from "~/server/db/schema";
import { getUserId } from "~/lib/auth";
import { decryptStepData, StepDataDecryptError } from "~/lib/crypto";
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

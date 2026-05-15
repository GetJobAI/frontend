import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { wizardSessions } from "~/server/db/schema";
import { getUserId } from "~/lib/auth";
import { encryptStepData } from "~/app/dashboard/resumes/wizard/lib/crypto";
import { isNull, and, eq, desc } from "drizzle-orm";

export async function POST() {
  try {
    const userId = await getUserId();

    const activeSessions = await db.query.wizardSessions.findMany({
      where: and(
        eq(wizardSessions.userId, userId),
        isNull(wizardSessions.completedAt),
      ),
      orderBy: [desc(wizardSessions.createdAt)],
      limit: 2,
    });
    const existing = activeSessions[0];
    if (existing) {
      if (activeSessions.length > 1) {
        console.error("[wizard/POST] multiple active sessions detected", {
          userId,
          sessionIds: activeSessions.map((session) => session.id),
        });
      }
      return NextResponse.json({
        sessionId: existing.id,
        currentStep: existing.currentStep,
      });
    }

    const [session] = await db
      .insert(wizardSessions)
      .values({
        userId,
        stepData: encryptStepData({}),
        source: "scratch",
      })
      .returning({ id: wizardSessions.id });

    return NextResponse.json(
      { sessionId: session!.id, currentStep: 1 },
      { status: 201 },
    );
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[wizard/POST]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

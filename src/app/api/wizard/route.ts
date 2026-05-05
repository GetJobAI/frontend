import { db } from "~/server/db";
import { wizardSessions } from "~/server/db/schema";
import { getUserId } from "~/lib/auth";
import { encryptStepData } from "~/lib/crypto";
import { isNull, and, eq, desc } from "drizzle-orm";

export async function POST() {
  try {
    const userId = await getUserId();

    // Enforce one active session per user
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
      return Response.json({
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

    return Response.json(
      { sessionId: session!.id, currentStep: 1 },
      { status: 201 },
    );
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[wizard/POST]", e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

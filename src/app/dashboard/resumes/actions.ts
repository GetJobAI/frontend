"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getUserId } from "~/lib/auth";
import { db } from "~/server/db";
import { resumes } from "~/server/db/schema";

export async function deleteResumeAction(resumeId: string) {
  try {
    const userId = await getUserId();

    const deleted = await db
      .delete(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
      .returning({ id: resumes.id });

    if (deleted.length === 0) {
      return { ok: false as const, error: "Resume not found" };
    }

    revalidatePath("/dashboard/resumes");
    return { ok: true as const };
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return { ok: false as const, error: "Unauthorized" };
    }
    console.error("[deleteResumeAction]", e);
    return { ok: false as const, error: "Failed to delete resume" };
  }
}


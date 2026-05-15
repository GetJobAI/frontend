"use server";

import { revalidatePath } from "next/cache";

import { getUserId } from "~/lib/auth";
import { deleteResumeOnBackend } from "~/server/api/resume";

export async function deleteResumeAction(resumeId: string) {
  try {
    const userId = await getUserId();

    const deleted = await deleteResumeOnBackend(userId, resumeId);

    if (!deleted) {
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

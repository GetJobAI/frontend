"use server";

import { revalidatePath } from "next/cache";

import { getUserId } from "~/lib/auth";
import {
  deleteResumes,
  getResumes,
  patchResumes,
} from "~/server/api/generated/resumes/resumes";
import { WIZARD_SESSION_CONTENT_KEY } from "~/app/dashboard/resumes/wizard/lib/resume-constants";
import type { Resumes } from "~/server/api/generated/schemas";
import type { ResumeListItem } from "./types";

type ResumeRow = Resumes & {
  input_method?: string | null;
  parse_status?: string | null;
};

function inferInputMethod(row: ResumeRow): string | null {
  if (row.input_method) {
    return row.input_method;
  }

  const content = row.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }

  const record = content as Record<string, unknown>;
  if (typeof record[WIZARD_SESSION_CONTENT_KEY] === "string") {
    return "wizard";
  }

  return "upload";
}

function mapRowToListItem(row: Resumes): ResumeListItem {
  const extended = row as ResumeRow;

  return {
    id: row.id,
    content: row.content,
    inputMethod: inferInputMethod(extended),
    parseStatus: extended.parse_status ?? null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function listResumesAction(): Promise<ResumeListItem[]> {
  try {
    const userId = await getUserId();
    const rows = await getResumes({
      user_id: `eq.${userId}`,
      order: "updated_at.desc",
    });
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows.map(mapRowToListItem);
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return [];
    }
    console.error("[listResumesAction]", e);
    return [];
  }
}

export async function getResumeAction(
  resumeId: string,
): Promise<ResumeListItem | null> {
  try {
    const userId = await getUserId();
    const rows = await getResumes({
      id: `eq.${resumeId}`,
      user_id: `eq.${userId}`,
      limit: "1",
    });
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return mapRowToListItem(rows[0]!);
  } catch (e) {
    if ((e as Error).message === "Unauthorized") return null;
    console.error("[getResumeAction]", e);
    return null;
  }
}

export async function updateResumeContentAction(
  resumeId: string,
  content: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await getUserId();
    await patchResumes(
      { id: `eq.${resumeId}`, user_id: `eq.${userId}` },
      {
        data: { content },
        validateStatus: (s) => s === 204 || s === 200,
      },
    );
    revalidatePath(`/dashboard/resumes/${resumeId}`);
    return { ok: true };
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return { ok: false, error: "Unauthorized" };
    }
    console.error("[updateResumeContentAction]", e);
    return { ok: false, error: "Failed to update resume" };
  }
}

export async function deleteResumeAction(resumeId: string) {
  try {
    const userId = await getUserId();

    const rows = await getResumes({
      id: `eq.${resumeId}`,
      user_id: `eq.${userId}`,
      select: "id",
      limit: "1",
    });
    if (!Array.isArray(rows) || rows.length === 0) {
      return { ok: false as const, error: "Resume not found" };
    }

    await deleteResumes(
      {
        id: `eq.${resumeId}`,
        user_id: `eq.${userId}`,
      },
      {
        validateStatus: (s) => s === 204 || s === 200,
      },
    );

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

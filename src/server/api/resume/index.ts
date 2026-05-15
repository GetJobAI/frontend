import { WIZARD_SESSION_CONTENT_KEY } from "~/app/dashboard/resumes/wizard/lib/resume-constants";
import { createBackendAxios } from "~/lib/api-backend";
import type { BackendResumeRow, ResumeListItem } from "./types";

function mapRowToListItem(row: BackendResumeRow): ResumeListItem {
  return {
    id: row.id,
    content: row.content,
    inputMethod: "wizard",
    parseStatus: "completed",
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function listUserResumesFromBackend(
  userId: string,
): Promise<ResumeListItem[]> {
  const client = createBackendAxios();
  const { data } = await client.get<BackendResumeRow[]>("/resumes", {
    params: {
      user_id: `eq.${userId}`,
      order: "updated_at.desc",
    },
  });
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(mapRowToListItem);
}

export async function findResumeByWizardSessionFromBackend(
  userId: string,
  sessionId: string,
): Promise<BackendResumeRow | null> {
  const client = createBackendAxios();
  const { data } = await client.get<BackendResumeRow[]>("/resumes", {
    params: {
      user_id: `eq.${userId}`,
      [`content->>${WIZARD_SESSION_CONTENT_KEY}`]: `eq.${sessionId}`,
      limit: 1,
    },
  });
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  return data[0] ?? null;
}

export async function createResumeOnBackend(input: {
  userId: string;
  content: Record<string, unknown>;
}): Promise<{ id: string }> {
  const client = createBackendAxios();
  const { data, status } = await client.post<
    BackendResumeRow | BackendResumeRow[]
  >(
    "/resumes",
    {
      user_id: input.userId,
      content: input.content,
    },
    {
      headers: {
        Prefer: "return=representation",
      },
      validateStatus: (s) => s === 201 || s === 200,
    },
  );

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) {
    throw new Error(
      `[createResumeOnBackend] unexpected response status=${status}`,
    );
  }
  return { id: row.id };
}

export async function deleteResumeOnBackend(
  userId: string,
  resumeId: string,
): Promise<boolean> {
  const client = createBackendAxios();
  const { data: rows } = await client.get<{ id: string }[]>("/resumes", {
    params: {
      id: `eq.${resumeId}`,
      user_id: `eq.${userId}`,
      select: "id",
      limit: 1,
    },
  });
  if (!Array.isArray(rows) || rows.length === 0) {
    return false;
  }
  const { status } = await client.delete("/resumes", {
    params: {
      id: `eq.${resumeId}`,
      user_id: `eq.${userId}`,
    },
    validateStatus: (s) => s === 204 || s === 200,
  });
  return status === 204 || status === 200;
}

export type { BackendResumeRow, ResumeListItem } from "./types";

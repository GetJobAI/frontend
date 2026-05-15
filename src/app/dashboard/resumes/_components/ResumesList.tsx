import { desc, eq } from "drizzle-orm";

import { ResumesListClient } from "./ResumesListClient";
import { db } from "~/server/db";
import { resumes } from "~/server/db/schema";

interface ResumesListProps {
  userId: string;
}

export async function ResumesList({ userId }: ResumesListProps) {
  const userResumes = await db
    .select({
      id: resumes.id,
      content: resumes.content,
      inputMethod: resumes.inputMethod,
      parseStatus: resumes.parseStatus,
      createdAt: resumes.createdAt,
      updatedAt: resumes.updatedAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));

  return <ResumesListClient resumes={userResumes} />;
}

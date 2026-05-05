import { type Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { ResumesListClient } from "./_components/ResumesListClient";
import { getUserId } from "~/lib/auth";
import { db } from "~/server/db";
import { resumes } from "~/server/db/schema";

export const metadata: Metadata = { title: "Resumes" };

export default async function ResumesPage() {
  const userId = await getUserId().catch(() => null);
  if (!userId) {
    redirect("/sign-in");
  }

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

  return (
    <ResumesListClient resumes={userResumes} />
  );
}

import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUserId } from "~/lib/auth";
import { getResumeAction } from "~/server/actions/resume/actions";
import { DashboardPageFill } from "~/app/dashboard/_components/DashboardPageFill";
import { ResumeEditorClient } from "./_components/ResumeEditorClient";
import type { ResumeContent } from "./_components/resume-content-types";

export const metadata: Metadata = { title: "Resume Editor" };

interface Props {
  params: Promise<{ resumeId: string }>;
}

export default async function ResumeEditorPage({ params }: Props) {
  const { resumeId } = await params;

  const userId = await getUserId().catch(() => null);
  if (!userId) redirect("/sign-in");

  const resume = await getResumeAction(resumeId);
  if (!resume) notFound();

  const rawContent =
    resume.content &&
    typeof resume.content === "object" &&
    !Array.isArray(resume.content)
      ? (resume.content as Record<string, unknown>)
      : {};

  const content: ResumeContent = rawContent;

  return (
    <DashboardPageFill>
      <ResumeEditorClient resumeId={resumeId} initialContent={content} />
    </DashboardPageFill>
  );
}

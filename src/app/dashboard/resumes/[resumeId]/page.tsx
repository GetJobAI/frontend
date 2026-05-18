import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUserId } from "~/lib/auth";
import { getResumeAction } from "~/server/actions/resume/actions";
import { DashboardPageFill } from "~/app/dashboard/_components/DashboardPageFill";
import { ResumeEditorClient } from "./_components/ResumeEditorClient";
import { parseEditorTab } from "./_components/editor-tabs";
import type { ResumeContent } from "./_components/resume-content-types";

export const metadata: Metadata = { title: "Resume Editor" };

interface Props {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ResumeEditorPage({
  params,
  searchParams,
}: Props) {
  const { resumeId } = await params;
  const { tab } = await searchParams;

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
  const initialTab = parseEditorTab(tab);

  return (
    <DashboardPageFill>
      <ResumeEditorClient
        resumeId={resumeId}
        initialContent={content}
        initialTab={initialTab}
      />
    </DashboardPageFill>
  );
}

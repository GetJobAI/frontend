import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUserId } from "~/lib/auth";
import { getResumeAction } from "~/server/actions/resume/actions";
import { DashboardPageFill } from "~/app/dashboard/_components/DashboardPageFill";
import { DashboardBackground } from "~/app/dashboard/_components/DashboardBackground";
import { ChooseTemplateClient } from "./_components/ChooseTemplateClient";

export const metadata: Metadata = { title: "Choose Template" };

interface Props {
  params: Promise<{ resumeId: string }>;
}

export default async function ChooseTemplatePage({ params }: Props) {
  const { resumeId } = await params;

  const userId = await getUserId().catch(() => null);
  if (!userId) redirect("/sign-in");

  const resume = await getResumeAction(resumeId);
  if (!resume) notFound();

  const content =
    resume.content &&
    typeof resume.content === "object" &&
    !Array.isArray(resume.content)
      ? (resume.content as Record<string, unknown>)
      : {};

  const currentStyle =
    typeof content.style === "string" &&
    ["professional", "technical", "minimal"].includes(content.style)
      ? (content.style as "professional" | "technical" | "minimal")
      : "professional";

  return (
    <DashboardPageFill>
      <DashboardBackground />
      <ChooseTemplateClient
        resumeId={resumeId}
        currentStyle={currentStyle}
        initialContent={content}
      />
    </DashboardPageFill>
  );
}

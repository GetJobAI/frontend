import { notFound, redirect } from "next/navigation";
import { getUserId } from "~/lib/auth";
import { getResumeAction } from "~/server/actions/resume/actions";
import { getOptimizations } from "~/server/api/generated/optimizations/optimizations";
import { getJobPostings } from "~/server/api/generated/job-postings/job-postings";
import type { JobPostings } from "~/server/api/generated/schemas";
import {
  extractLatestOptimization,
  fetchLatestOptimizationForResume,
} from "~/server/actions/optimizer/test/cover-letter-shared";
import type { ResumeContent } from "~/app/dashboard/resumes/[resumeId]/_components/resume-content-types";
import { CoverLetterPageClient } from "./_components/CoverLetterPageClient";

interface Props {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{ optimisationId?: string }>;
}

export default async function CoverLetterPage({ params, searchParams }: Props) {
  const { resumeId } = await params;
  const { optimisationId } = await searchParams;

  const userId = await getUserId().catch(() => null);
  if (!userId) redirect("/sign-in");

  const resume = await getResumeAction(resumeId);
  if (!resume) notFound();

  let optimization = null;
  if (optimisationId) {
    const rows = await getOptimizations({ id: `eq.${optimisationId}` }).catch(
      () => null,
    );
    optimization = extractLatestOptimization(rows);
  } else {
    optimization = await fetchLatestOptimizationForResume(resumeId).catch(
      () => null,
    );
  }

  // If no optimization is found, redirect back to resume workspace tailoring tab
  if (!optimization) {
    redirect(`/dashboard/resumes/${resumeId}?tab=job-tailoring`);
  }

  let jobPosting: JobPostings | null = null;
  if (optimization.job_posting_id) {
    const postings = await getJobPostings({
      id: `eq.${optimization.job_posting_id}`,
    }).catch(() => null);
    if (Array.isArray(postings) && postings.length > 0) {
      jobPosting = postings[0] ?? null;
    }
  }

  return (
    <div className="flex h-svh w-full overflow-hidden bg-neutral-950 text-white select-none">
      <CoverLetterPageClient
        resumeId={resumeId}
        initialResumeContent={resume.content as ResumeContent}
        optimization={optimization}
        jobPosting={jobPosting}
      />
    </div>
  );
}

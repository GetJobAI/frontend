import { type Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ResumesCreatePaths } from "./_components/ResumesCreatePaths";
import { ResumesList } from "./_components/ResumesList";
import { ResumesListSkeleton } from "./_components/ResumesListSkeleton";
import { getUserId } from "~/lib/auth";

export const metadata: Metadata = { title: "Resumes" };

export default async function ResumesPage() {
  const userId = await getUserId().catch(() => null);
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold text-white">Resumes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create, tailor, and manage every version of your CV.
        </p>
      </div>

      <div className="shrink-0">
        <ResumesCreatePaths />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<ResumesListSkeleton />}>
          <ResumesList />
        </Suspense>
      </div>
    </div>
  );
}

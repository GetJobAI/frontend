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
    <div className="flex h-full flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Resumes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create, inspect, and manage all of your resumes.
        </p>
      </div>

      <ResumesCreatePaths />

      <Suspense fallback={<ResumesListSkeleton />}>
        <ResumesList userId={userId} />
      </Suspense>
    </div>
  );
}

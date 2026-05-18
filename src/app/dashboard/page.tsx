import { type Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { getUserId } from "~/lib/auth";
import { DashboardBackground } from "~/app/dashboard/_components/DashboardBackground";
import { UserBadge } from "~/app/dashboard/_components/UserBadge";
import { ResumesCreatePaths } from "~/app/dashboard/resumes/_components/ResumesCreatePaths";
import { ResumesList } from "~/app/dashboard/resumes/_components/ResumesList";
import { ResumesListSkeleton } from "~/app/dashboard/resumes/_components/ResumesListSkeleton";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const userId = await getUserId().catch(() => null);
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  const firstName =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "there";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <DashboardBackground />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-widest text-neutral-600 uppercase">
              {today}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Hey, {firstName}
            </h1>
          </div>
          <UserBadge />
        </div>

        <section aria-label="Create a resume">
          <ResumesCreatePaths />
        </section>

        <section
          aria-label="Your resumes"
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          <Suspense fallback={<ResumesListSkeleton />}>
            <ResumesList />
          </Suspense>
        </section>
      </div>
    </>
  );
}

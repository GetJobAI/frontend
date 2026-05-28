import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardBackground } from "~/app/dashboard/_components/DashboardBackground";
import { DashboardPageFill } from "~/app/dashboard/_components/DashboardPageFill";
import { getUserId } from "~/lib/auth";
import { UploadResumeClient } from "./_components/UploadResumeClient";

export const metadata: Metadata = { title: "Upload Resume" };

export default async function UploadResumePage() {
  const userId = await getUserId().catch(() => null);
  if (!userId) redirect("/sign-in");

  return (
    <DashboardPageFill>
      <DashboardBackground />
      <UploadResumeClient />
    </DashboardPageFill>
  );
}

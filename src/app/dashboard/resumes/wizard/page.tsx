import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { type Metadata } from "next";
import { WizardShell } from "./_components/WizardShell";

export const metadata: Metadata = {
  title: "Resume Wizard",
  description: "Build your resume step by step with our 9-step guided wizard.",
};

export default async function WizardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <WizardShell />;
}

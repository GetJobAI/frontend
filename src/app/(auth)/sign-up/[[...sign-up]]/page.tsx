import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { resolveAuthRedirectUrl } from "~/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { userId } = await auth();
  const { redirect_url } = await searchParams;
  const afterAuthUrl = resolveAuthRedirectUrl(redirect_url);

  if (userId) {
    redirect(afterAuthUrl);
  }

  return (
    <div className="flex w-full justify-center">
      <SignUp fallbackRedirectUrl={afterAuthUrl} />
    </div>
  );
}

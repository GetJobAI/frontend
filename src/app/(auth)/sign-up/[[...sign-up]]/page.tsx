import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { type Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignUpPage() {
  const userId = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex w-full justify-center">
      <SignUp />
    </div>
  );
}

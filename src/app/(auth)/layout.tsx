import { type ReactNode } from "react";
import { Logo } from "~/components/global/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="landing-bg-base relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="landing-bg-grid pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="landing-bg-noise pointer-events-none absolute inset-0 opacity-50"
      />
      <div className="relative z-10 flex w-full flex-col items-center gap-8 px-4">
        <Logo size="md" />
        <div className="w-full max-w-md">{children}</div>

        <p className="text-xs text-neutral-600">
          Secure authentication powered by Clerk
        </p>
      </div>
    </div>
  );
}

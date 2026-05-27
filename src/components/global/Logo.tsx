import Link from "next/link";
import Image from "next/image";
import { cn } from "~/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  /** When false, only the wordmark is shown (e.g. to align with sidebar menu column). */
  showMark?: boolean;
}

export function Logo({
  className,
  size = "md",
  href = "/",
  showMark = true,
}: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  const content = (
    <span
      className={cn(
        "font-semibold tracking-tight select-none",
        sizeClasses[size],
        className,
      )}
    >
      Getjob
      <span className="text-violet-400">AI</span>
    </span>
  );

  const rowClass = cn("inline-flex items-center", showMark ? "gap-2" : "pl-3");

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {showMark ? <LogoMark size={size} /> : null}
        {content}
      </Link>
    );
  }

  return (
    <span className={rowClass}>
      {showMark ? <LogoMark size={size} /> : null}
      {content}
    </span>
  );
}

function LogoMark({ size }: { size: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? 28 : size === "md" ? 22 : 18;
  return (
    <Image
      src="/favicon.ico"
      alt=""
      aria-hidden="true"
      width={dim}
      height={dim}
      className="rounded-md"
    />
  );
}

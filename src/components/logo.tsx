import Link from "next/link";
import Image from "next/image";
import { cn } from "~/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
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
      GetJob
      <span className="text-violet-400">AI</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center gap-2">
        <LogoMark size={size} />
        {content}
      </Link>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
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

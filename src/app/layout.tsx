import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";

export const metadata: Metadata = {
  title: {
    default: "GetJobAI — AI-Powered Resume Optimization",
    template: "%s | GetJobAI",
  },
  description:
    "Get past ATS filters and land more interviews. AI-powered resume optimization, rewriting, and LinkedIn import — in under 60 seconds.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      <html lang="en" className={`${geist.variable} dark`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

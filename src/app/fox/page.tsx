import { type Metadata } from "next";
import { NoConnectionFox } from "~/app/fox/_components/NoConnectionFox";

export const metadata: Metadata = {
  title: "Fox",
};

export default function FoxPage() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-[#1c1b22]">
      <div className="flex aspect-square size-[min(100vw,100svh)] items-center justify-center p-8">
        <NoConnectionFox className="h-full w-full" />
      </div>
    </main>
  );
}

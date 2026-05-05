import { type Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = { title: "Resumes" };

export default function ResumesPage() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Resumes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          All your created and imported resumes will appear here.
        </p>
      </div>

      <div className="card-surface flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
          <FileText
            className="size-[22px]"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white">No resumes yet</p>
          <p className="mt-1 text-xs text-neutral-500">
            Create your first resume from the dashboard overview.
          </p>
        </div>
        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
          Coming soon
        </span>
      </div>
    </div>
  );
}

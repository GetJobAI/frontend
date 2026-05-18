import { Skeleton } from "~/components/ui/skeleton";

const CARD_COUNT = 2;

function ResumeCardSkeleton() {
  return (
    <article className="card-surface relative overflow-hidden">
      <div className="relative flex flex-col lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 gap-5 p-5 sm:p-6 lg:pr-4">
          <Skeleton className="size-12 shrink-0 rounded-2xl bg-white/8" />

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-6 w-48 max-w-full bg-white/8" />
                <Skeleton className="h-4 w-40 max-w-full bg-white/6" />
              </div>
              <Skeleton className="size-4 shrink-0 rounded-sm bg-white/6" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-20 rounded-full bg-white/6" />
              <Skeleton className="h-5 w-24 rounded-full bg-white/6" />
              <Skeleton className="h-5 w-16 rounded-full bg-white/6" />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-white/6 p-4 sm:gap-3 sm:px-6 lg:border-t-0 lg:border-l lg:p-5">
          <Skeleton className="size-12 shrink-0 rounded-xl bg-white/8" />
          <Skeleton className="size-12 shrink-0 rounded-xl bg-white/6" />
        </div>
      </div>
    </article>
  );
}

export function ResumesListSkeleton() {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 items-end justify-between gap-3 px-0.5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 bg-white/6" />
          <Skeleton className="h-6 w-28 bg-white/8" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-0.5">
        {Array.from({ length: CARD_COUNT }, (_, index) => (
          <ResumeCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

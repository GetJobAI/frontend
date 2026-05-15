import { Skeleton } from "~/components/ui/skeleton";

const ROW_COUNT = 4;

export function ResumesListSkeleton() {
  return (
    <div className="card-surface flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-white/6 px-4 py-3">
        <Skeleton className="h-4 w-36 bg-white/8" />
      </div>
      <div className="flex flex-col divide-y divide-white/6">
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32 bg-white/8" />
              <Skeleton className="h-3 w-56 max-w-full bg-white/6" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-md bg-white/8" />
              <Skeleton className="size-8 rounded-md bg-white/8" />
              <Skeleton className="size-8 rounded-md bg-white/8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

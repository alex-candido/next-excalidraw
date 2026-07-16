import { Skeleton } from "@/components/ui/skeleton";

export function AppPresentationCardSkeleton() {
  return (
    <div className="app-presentation-card-skeleton relative aspect-video overflow-hidden rounded-lg border bg-muted">
      <div className="absolute left-2 top-2 flex items-center gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
        <Skeleton className="size-7 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

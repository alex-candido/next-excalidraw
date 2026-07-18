import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AppPresentationsStatCardSkeleton() {
  return (
    <Card size="sm" className="app-presentations-stat-card-skeleton min-w-0 flex-1 basis-0">
      <CardContent className="flex flex-col gap-1.5 sm:gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-6 w-12" />
      </CardContent>
    </Card>
  );
}

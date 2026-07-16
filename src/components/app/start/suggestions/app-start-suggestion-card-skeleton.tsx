import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Espelha a estrutura real de AppStartSuggestionCard (ícone + 2 badges + título
// + descrição), pra não haver salto de layout quando os dados chegarem.
export function AppStartSuggestionCardSkeleton() {
  return (
    <Card className="app-start-suggestion-card-skeleton p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-5 w-8 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-2/3 rounded" />
      </div>
    </Card>
  );
}

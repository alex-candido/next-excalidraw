import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AppPresentationsStatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}

export function AppPresentationsStatCard({
  icon: Icon,
  label,
  value,
  className,
}: AppPresentationsStatCardProps) {
  return (
    <Card size="sm" className={cn("app-presentations-stat-card min-w-0 flex-1 basis-0", className)}>
      <CardContent className="flex flex-col gap-1.5 sm:gap-2">
        <div className="app-presentations-stat-card-header flex items-center gap-1.5 text-muted-foreground sm:gap-2">
          <Icon className="size-3.5 shrink-0 sm:size-4" />
          <span className="app-presentations-stat-card-label truncate text-[0.65rem] font-medium sm:text-xs">
            {label}
          </span>
        </div>
        <span className="app-presentations-stat-card-value font-mono text-base font-semibold tabular-nums sm:text-lg">
          {value}
        </span>
      </CardContent>
    </Card>
  );
}

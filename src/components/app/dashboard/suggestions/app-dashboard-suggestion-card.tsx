import { type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AppDashboardSuggestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  type: "multi" | "single";
  typeLabel: string;
  icon: LucideIcon;
}

export function AppDashboardSuggestionCard({
  label,
  type,
  typeLabel,
  icon: Icon,
  className,
  ...props
}: AppDashboardSuggestionCardProps) {
  return (
    <Card
      className={cn(
        "app-dashboard-suggestion-card cursor-pointer p-4 flex flex-col gap-3 transition-colors hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <div className="app-dashboard-suggestion-card-header flex items-start justify-between gap-2">
        <div className="app-dashboard-suggestion-card-icon size-8 rounded-md bg-muted flex items-center justify-center">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <Badge
          variant={type === "multi" ? "secondary" : "outline"}
          className="app-dashboard-suggestion-card-type rounded-full text-xs"
        >
          {typeLabel}
        </Badge>
      </div>
      <p className="app-dashboard-suggestion-card-label text-sm text-muted-foreground leading-relaxed">
        {label}
      </p>
    </Card>
  );
}

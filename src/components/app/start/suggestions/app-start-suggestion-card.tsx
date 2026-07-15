import { type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AppStartSuggestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  type: "multi" | "single";
  typeLabel: string;
  icon: LucideIcon;
}

export function AppStartSuggestionCard({
  label,
  type,
  typeLabel,
  icon: Icon,
  className,
  ...props
}: AppStartSuggestionCardProps) {
  return (
    <Card
      className={cn(
        "app-start-suggestion-card cursor-pointer p-4 flex flex-col gap-3 transition-colors hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <div className="app-start-suggestion-card-header flex items-start justify-between gap-2">
        <div className="app-start-suggestion-card-icon size-8 rounded-md bg-muted flex items-center justify-center">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <Badge
          variant={type === "multi" ? "secondary" : "outline"}
          className="app-start-suggestion-card-type rounded-full text-xs"
        >
          {typeLabel}
        </Badge>
      </div>
      <p className="app-start-suggestion-card-label text-sm text-muted-foreground leading-relaxed">
        {label}
      </p>
    </Card>
  );
}

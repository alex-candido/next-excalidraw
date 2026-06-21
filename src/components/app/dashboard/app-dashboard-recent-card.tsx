import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface AppDashboardRecentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  type: string;
  date: string;
}

export function AppDashboardRecentCard({
  title,
  type,
  date,
  className,
  ...props
}: AppDashboardRecentCardProps) {
  return (
    <Card
      className={cn(
        "app-dashboard-recent-card overflow-hidden cursor-pointer transition-colors hover:bg-muted/50",
        className,
      )}
      {...props}
    >
      <div className="app-dashboard-recent-card-thumbnail aspect-video w-full bg-muted" />
      <div className="app-dashboard-recent-card-body flex items-start justify-between gap-2 p-3">
        <div className="app-dashboard-recent-card-info flex flex-col gap-1 min-w-0">
          <span className="app-dashboard-recent-card-title text-sm font-medium truncate">
            {title}
          </span>
          <Muted className="app-dashboard-recent-card-date text-xs">{date}</Muted>
        </div>
        <div className="app-dashboard-recent-card-meta flex items-center gap-1.5 shrink-0">
          <Badge variant="secondary" className="rounded-full text-xs">
            {type}
          </Badge>
          <Button variant="ghost" size="icon-xs" aria-label="Opções">
            <MoreHorizontal className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

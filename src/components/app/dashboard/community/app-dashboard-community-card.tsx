import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

interface AppDashboardCommunityCardProps {
  id: string;
  title: string;
  author: string;
  type: (typeof PresentationType)[keyof typeof PresentationType];
  typeLabel: string;
  className?: string;
}

export function AppDashboardCommunityCard({
  id,
  title,
  author,
  type,
  typeLabel,
  className,
}: AppDashboardCommunityCardProps) {
  return (
    <Link
      href={`/app/community/${id}`}
      className={cn(
        "app-dashboard-community-card relative block aspect-video overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90",
        className,
      )}
    >
      <div className="app-dashboard-community-card-badges absolute right-2 top-2 flex items-center gap-1.5">
        <Badge
          variant={type === PresentationType.multi ? "secondary" : "outline"}
          className="app-dashboard-community-card-type rounded-full bg-background/80 text-xs backdrop-blur-sm"
        >
          {typeLabel}
        </Badge>
      </div>

      <div className="app-dashboard-community-card-overlay absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
        <div className="app-dashboard-community-card-info flex min-w-0 flex-col gap-0.5">
          <span className="app-dashboard-community-card-title truncate text-sm font-medium leading-snug text-white">
            {title}
          </span>
          <span className="app-dashboard-community-card-author text-xs text-white/60">
            {author}
          </span>
        </div>
        <div className="app-dashboard-community-card-action flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <ArrowRight className="size-3.5 text-white" />
        </div>
      </div>
    </Link>
  );
}

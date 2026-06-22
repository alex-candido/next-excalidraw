import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

interface AppDashboardTemplatesCardProps {
  id: string;
  title: string;
  type: (typeof PresentationType)[keyof typeof PresentationType];
  typeLabel: string;
  className?: string;
}

export function AppDashboardTemplatesCard({
  id,
  title,
  type,
  typeLabel,
  className,
}: AppDashboardTemplatesCardProps) {
  return (
    <Link
      href={`/app/templates/${id}`}
      className={cn(
        "app-dashboard-templates-card relative block aspect-video overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90",
        className,
      )}
    >
      <div className="app-dashboard-templates-card-badges absolute right-2 top-2 flex items-center gap-1.5">
        <Badge
          variant={type === PresentationType.multi ? "secondary" : "outline"}
          className="app-dashboard-templates-card-type rounded-full bg-background/80 text-xs backdrop-blur-sm"
        >
          {typeLabel}
        </Badge>
      </div>

      <div className="app-dashboard-templates-card-overlay absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
        <span className="app-dashboard-templates-card-title truncate text-sm font-medium leading-snug text-white">
          {title}
        </span>
        <div className="app-dashboard-templates-card-action flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <ArrowRight className="size-3.5 text-white" />
        </div>
      </div>
    </Link>
  );
}

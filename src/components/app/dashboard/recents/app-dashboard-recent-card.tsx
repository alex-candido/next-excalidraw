import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  PresentationLanguage,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

const LANGUAGE_CODE: Record<number, string> = {
  [PresentationLanguage.en]: "EN",
  [PresentationLanguage.es]: "ES",
  [PresentationLanguage.fr]: "FR",
  [PresentationLanguage.de]: "DE",
  [PresentationLanguage.it]: "IT",
  [PresentationLanguage.ptBR]: "PT",
  [PresentationLanguage.ru]: "RU",
  [PresentationLanguage.zh]: "ZH",
  [PresentationLanguage.ja]: "JA",
  [PresentationLanguage.ko]: "KO",
};

interface AppDashboardRecentCardProps {
  title: string;
  type: (typeof PresentationType)[keyof typeof PresentationType];
  language: (typeof PresentationLanguage)[keyof typeof PresentationLanguage];
  slideCount: number;
  typeLabel: string;
  href: string;
  className?: string;
}

export function AppDashboardRecentCard({
  title,
  type,
  language,
  slideCount,
  typeLabel,
  href,
  className,
}: AppDashboardRecentCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "app-dashboard-recent-card relative block aspect-video overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-90",
        className,
      )}
    >
      <div className="app-dashboard-recent-card-badges absolute right-2 top-2 flex items-center gap-1.5">
        <Badge
          variant={type === PresentationType.multi ? "secondary" : "outline"}
          className="app-dashboard-recent-card-type rounded-full bg-background/80 text-xs backdrop-blur-sm"
        >
          {typeLabel}
        </Badge>
        <Badge
          variant="outline"
          className="app-dashboard-recent-card-language rounded-full bg-background/80 text-xs backdrop-blur-sm"
        >
          {LANGUAGE_CODE[language] ?? "–"}
        </Badge>
      </div>

      <div className="app-dashboard-recent-card-overlay absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
        <div className="app-dashboard-recent-card-info flex min-w-0 flex-col gap-0.5">
          <span className="app-dashboard-recent-card-title truncate text-sm font-medium leading-snug text-white">
            {title}
          </span>
          {type === PresentationType.multi && slideCount > 0 && (
            <span className="app-dashboard-recent-card-slides text-xs text-white/60">
              {slideCount} slides
            </span>
          )}
        </div>
        <div className="app-dashboard-recent-card-action flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <ArrowRight className="size-3.5 text-white" />
        </div>
      </div>
    </Link>
  );
}

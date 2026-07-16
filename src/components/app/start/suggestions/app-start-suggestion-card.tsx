"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";
import { iconUtils } from "@/lib/utils/icon";
import type { PresentationEntrySuggestion } from "@/schemas/app/presentation-entry-schema";
import { LANGUAGE_CODE } from "@/schemas/app/presentation-schema";

interface AppStartSuggestionCardProps {
  entry: PresentationEntrySuggestion;
  selected: boolean;
  onClick: () => void;
}

export function AppStartSuggestionCard({ entry, selected, onClick }: AppStartSuggestionCardProps) {
  const t = useTranslations("app.start.suggestions");
  const Icon = iconUtils().resolve(entry.icon);

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={cn(
        "app-start-suggestion-card cursor-pointer p-4 flex flex-col gap-3 transition-colors hover:bg-muted/50",
        selected && "ring-2 ring-primary bg-primary/5 hover:bg-primary/5",
      )}
    >
      <div className="app-start-suggestion-card-header flex items-start justify-between gap-2">
        <div className="app-start-suggestion-card-icon flex size-8 items-center justify-center rounded-md bg-muted text-lg">
          <Icon className={`${entry.icon}`} />
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="app-start-suggestion-card-language rounded-full text-xs">
            {LANGUAGE_CODE[entry.language] ?? "?"}
          </Badge>
          {entry.type === PresentationType.multi && (
            <Badge variant="secondary" className="app-start-suggestion-card-slides rounded-full text-xs">
              {t("minSlides", { count: entry.slideCount })}
            </Badge>
          )}
        </div>
      </div>
      <div className="app-start-suggestion-card-body flex flex-col gap-1">
        <span className="text-sm font-medium">{entry.title}</span>
        <span className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{entry.description}</span>
      </div>
    </Card>
  );
}

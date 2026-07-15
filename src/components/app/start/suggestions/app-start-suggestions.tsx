import { KeyRound, Network, Route, Shuffle, UserPlus, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { AppStartSuggestionCard } from "@/components/app/start/suggestions/app-start-suggestion-card";

type SuggestionItem = { label: string; type: "multi" | "single" };

const SUGGESTION_ICONS: LucideIcon[] = [KeyRound, Network, Route, UserPlus];

export async function AppStartSuggestions({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.start.suggestions");
  const items = t.raw("items") as SuggestionItem[];

  return (
    <LayoutSection className="first:pt-6 md:pb-16 md:first:pt-8">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-start-suggestions w-full max-w-4xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <div className="app-start-suggestions-header flex items-start justify-between gap-4">
            <div className="app-start-suggestions-header-text flex flex-col gap-1">
              <span className="app-start-suggestions-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("title")}
              </span>
              <Muted className="app-start-suggestions-description text-sm">{t("description")}</Muted>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-xs">
              <Shuffle className="size-3.5" />
              {t("shuffle")}
            </Button>
          </div>
          <div className="app-start-suggestions-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <AppStartSuggestionCard
                key={i}
                label={item.label}
                type={item.type}
                typeLabel={t(`types.${item.type}`)}
                icon={SUGGESTION_ICONS[i % SUGGESTION_ICONS.length]}
              />
            ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

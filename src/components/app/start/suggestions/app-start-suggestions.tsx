"use client";

import { Shuffle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { useAppPresentationSuggestion } from "@/hooks/app/use-app-presentation-suggestion";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";
import { useAppStart } from "@/providers/app/app-start-provider";

import { AppStartSuggestionCard } from "@/components/app/start/suggestions/app-start-suggestion-card";
import { AppStartSuggestionCardSkeleton } from "@/components/app/start/suggestions/app-start-suggestion-card-skeleton";

// Bate com o default de `presentationEntrySuggestionListSchema.limit` — o hook
// não passa `limit` explícito, então é sempre esse valor vindo do servidor.
const SKELETON_COUNT = 6;

export function AppStartSuggestions({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.start.suggestions");
  const { type, language, selectedSuggestionId, onSelectSuggestion } = useAppStart();
  const { useList } = useAppPresentationSuggestion();

  // type vem do RHF (só fica undefined antes do 1º render aplicar os
  // defaultValues) — fallback nunca acontece na prática.
  const [exclude, setExclude] = useState<string[]>([]);
  const { data: suggestions, isLoading } = useList(type ?? PresentationType.multi, language, exclude);

  // Só evita repetir o que está na tela agora — o pool (24 suggestions) ainda
  // é pequeno o bastante pra não precisar de exclusão acumulada entre embaralhadas.
  const onShuffle = () => setExclude(suggestions?.map((s) => s.id) ?? []);

  // Só esconde a seção inteira quando já sabemos que não tem suggestion pra
  // esse type/idioma (loading terminou, resultado vazio) — durante o loading
  // (1ª carga ou depois de embaralhar) mostra o skeleton, nunca some a seção.
  if (!isLoading && !suggestions?.length) return null;

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
            <Button
              variant="outline"
              size="sm"
              className="app-start-suggestions-shuffle shrink-0 gap-1.5 text-xs"
              onClick={onShuffle}
              disabled={isLoading}
            >
              <Shuffle className="size-3.5" />
              {t("shuffle")}
            </Button>
          </div>
          <div className="app-start-suggestions-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <AppStartSuggestionCardSkeleton key={i} />
                ))
              : suggestions!.map((entry) => (
                  <AppStartSuggestionCard
                    key={entry.id}
                    entry={entry}
                    selected={selectedSuggestionId === entry.id}
                    onClick={() => onSelectSuggestion(entry)}
                  />
                ))}
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

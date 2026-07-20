"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Muted } from "@/components/ui/typography";

// Estrutura mínima mockada (não implementado ainda) — pra visualizar o
// encaixe da feature já prevista desde a spec original do editor (Ciclo 3)
// e discutir se abre novas ideias, não pra funcionar de verdade.
const CATEGORY_KEYS = ["cover", "flowchart", "comparison", "timeline", "summary", "closing"] as const;

export function AppPresentationsStudioPanelTemplates() {
  const t = useTranslations("app.studio.panel.templates");

  return (
    <div className="app-presentations-studio-panel-templates flex flex-col gap-2 p-3">
      <Muted className="text-xs">{t("description")}</Muted>
      <div className="app-presentations-studio-panel-templates-grid grid grid-cols-2 gap-2">
        {CATEGORY_KEYS.map((key) => (
          <div
            key={key}
            aria-disabled
            className="app-presentations-studio-panel-templates-card relative flex aspect-video items-center justify-center rounded-md border bg-muted/40 text-[11px] text-muted-foreground/70"
          >
            {t(`categories.${key}`)}
          </div>
        ))}
      </div>
      <Badge variant="outline" className="app-presentations-studio-panel-templates-soon mt-1 w-fit text-[10px]">
        {t("comingSoon")}
      </Badge>
    </div>
  );
}

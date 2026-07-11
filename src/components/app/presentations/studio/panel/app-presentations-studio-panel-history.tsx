"use client";

import { History } from "lucide-react";
import { useTranslations } from "next-intl";

import { Muted } from "@/components/ui/typography";

export function AppPresentationsStudioPanelHistory() {
  const t = useTranslations("app.studio.panel.history");

  return (
    <div className="app-presentations-studio-panel-history flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <History className="size-6 text-muted-foreground/40" />
      <Muted className="app-presentations-studio-panel-history-label text-xs">
        {t("comingSoon")}
      </Muted>
    </div>
  );
}

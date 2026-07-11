"use client";

import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Muted } from "@/components/ui/typography";

export function AppPresentationsStudioPanelSettings() {
  const t = useTranslations("app.studio.panel.settings");

  return (
    <div className="app-presentations-studio-panel-settings flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <Settings2 className="size-6 text-muted-foreground/40" />
      <Muted className="app-presentations-studio-panel-settings-label text-xs">
        {t("comingSoon")}
      </Muted>
    </div>
  );
}

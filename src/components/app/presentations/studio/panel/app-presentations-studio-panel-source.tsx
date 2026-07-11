"use client";

import { Code2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Muted } from "@/components/ui/typography";

export function AppPresentationsStudioPanelSource() {
  const t = useTranslations("app.studio.panel.source");

  return (
    <div className="app-presentations-studio-panel-source flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <Code2 className="size-6 text-muted-foreground/40" />
      <Muted className="app-presentations-studio-panel-source-label text-xs">
        {t("comingSoon")}
      </Muted>
    </div>
  );
}

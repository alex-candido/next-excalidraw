"use client";

import { PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppPresentationsStudio } from "@/providers/app/app-presentations-studio-provider";

export function AppPresentationsStudioSlideListHeader() {
  const t = useTranslations("app.studio.slideList");
  const { title } = useAppPresentationsStudio();

  return (
    <div className="app-presentations-studio-slide-list-header flex flex-col gap-1.5 border-b p-2.5">
      <div className="app-presentations-studio-slide-list-header-title-row flex items-center justify-between gap-1.5">
        <h2 className="app-presentations-studio-slide-list-header-title truncate text-xs font-medium">
          {title}
        </h2>
        <Button variant="ghost" size="icon-xs" aria-label={t("editName")}>
          <PenLine className="size-3" />
        </Button>
      </div>
      <Badge
        variant="secondary"
        className="app-presentations-studio-slide-list-header-engine h-4.5 w-fit gap-1 rounded-full px-1.5 text-[10px]"
      >
        {t("engine")}
      </Badge>
    </div>
  );
}

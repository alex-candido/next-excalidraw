"use client";

import { GalleryVerticalEnd, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { useAppStart } from "@/providers/app/app-start-provider";

export function AppStartFormOptions() {
  const t = useTranslations("app.start.form.options");
  const { type, onTypeChange } = useAppStart();

  return (
    <div className="app-start-form-options flex items-center gap-1.5">
      <Button
        variant={type === PresentationType.multi ? "outline" : "ghost"}
        size="sm"
        className="gap-1.5"
        onClick={() => onTypeChange(PresentationType.multi)}
      >
        <GalleryVerticalEnd className="size-3.5" />
        <span className="hidden sm:inline">{t("multi")}</span>
      </Button>
      <Button
        variant={type === PresentationType.single ? "outline" : "ghost"}
        size="sm"
        className="gap-1.5 text-muted-foreground"
        onClick={() => onTypeChange(PresentationType.single)}
      >
        <PenLine className="size-3.5" />
        <span className="hidden sm:inline">{t("single")}</span>
      </Button>
    </div>
  );
}

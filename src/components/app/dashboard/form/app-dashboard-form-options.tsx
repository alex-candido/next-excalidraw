"use client";

import { GalleryVerticalEnd, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function AppDashboardFormOptions() {
  const t = useTranslations("app.dashboard.form.options");

  return (
    <div className="app-dashboard-form-options flex items-center gap-1.5">
      <Button variant="outline" size="sm" className="gap-1.5">
        <GalleryVerticalEnd className="size-3.5" />
        <span className="hidden sm:inline">{t("multi")}</span>
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
        <PenLine className="size-3.5" />
        <span className="hidden sm:inline">{t("single")}</span>
      </Button>
    </div>
  );
}

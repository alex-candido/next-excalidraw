"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { Link } from "@/i18n/navigation";

export function AppDashboardTemplatesHeader() {
  const t = useTranslations("app.dashboard.templates");

  return (
    <div className="app-dashboard-templates-header flex items-start justify-between gap-4">
      <div className="app-dashboard-templates-header-text flex flex-col gap-1">
        <span className="app-dashboard-templates-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("title")}
        </span>
        <Muted className="app-dashboard-templates-description text-sm">
          {t("description")}
        </Muted>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 gap-1.5 text-xs"
        render={<Link href="/app/templates" />}
        nativeButton={false}
      >
        <ArrowRight className="size-3.5" />
        <span className="hidden sm:inline">{t("viewAll")}</span>
      </Button>
    </div>
  );
}

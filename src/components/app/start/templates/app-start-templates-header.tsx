"use client";

import { ArrowRight, LayoutTemplate } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { Link } from "@/i18n/navigation";

export function AppStartTemplatesHeader() {
  const t = useTranslations("app.start.templates");

  return (
    <div className="app-start-templates-header flex items-start justify-between gap-4">
      <div className="app-start-templates-header-text flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
          <LayoutTemplate className="size-3.5 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="app-start-templates-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("title")}
          </span>
          <Muted className="app-start-templates-description text-sm">
            {t("description")}
          </Muted>
        </div>
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

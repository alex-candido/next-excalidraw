"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { AppPresentationsSearch } from "@/components/app/app-presentations-search";

export function AppTemplatesHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("app.templates.header");

  return (
    <div
      className={cn(
        "app-templates-header flex items-center justify-between gap-4",
        className,
      )}
      {...props}
    >
      <span className="app-templates-header-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("title")}
      </span>
      <AppPresentationsSearch />
    </div>
  );
}

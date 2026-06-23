"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { AppPresentationsSearch } from "@/components/app/app-presentations-search";

export function AppCommunityHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("app.community.header");

  return (
    <div
      className={cn(
        "app-community-header flex items-center justify-between gap-4",
        className,
      )}
      {...props}
    >
      <span className="app-community-header-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("title")}
      </span>
      <AppPresentationsSearch />
    </div>
  );
}

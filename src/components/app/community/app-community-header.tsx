"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

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
      <div className="app-community-header-nav flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/app/dashboard" />}
          nativeButton={false}
          className="app-community-header-back -ml-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t("back")}
        </Button>
        <span className="app-community-header-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("title")}
        </span>
      </div>
      <AppPresentationsSearch />
    </div>
  );
}

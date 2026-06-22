import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { Link } from "@/i18n/navigation";

export async function AppDashboardCommunityHeader() {
  const t = await getTranslations("app.dashboard.community");

  return (
    <div className="app-dashboard-community-header flex items-start justify-between gap-4">
      <div className="app-dashboard-community-header-text flex flex-col gap-1">
        <span className="app-dashboard-community-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("title")}
        </span>
        <Muted className="app-dashboard-community-description text-sm">
          {t("description")}
        </Muted>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 gap-1.5 text-xs"
        render={<Link href="/app/community" />}
        nativeButton={false}
      >
        <ArrowRight className="size-3.5" />
        <span className="hidden sm:inline">{t("viewAll")}</span>
      </Button>
    </div>
  );
}

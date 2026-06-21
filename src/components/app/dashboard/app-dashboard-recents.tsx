import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export async function AppDashboardRecents({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.dashboard.recents");

  return (
    <LayoutSection className="pb-8 first:pt-10 md:pb-10 md:first:pt-14">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-dashboard-recents w-full max-w-3xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <div className="app-dashboard-recents-header flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("title")}
              </span>
              <Muted className="text-sm">{t("description")}</Muted>
            </div>
            <Link
              href="/app/presentations"
              className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="app-dashboard-recents-empty">
            <Muted className="text-sm">{t("empty")}</Muted>
          </div>
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

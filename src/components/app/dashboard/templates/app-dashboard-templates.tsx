import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppDashboardTemplatesCard } from "@/components/app/dashboard/templates/app-dashboard-templates-card";
import { AppDashboardTemplatesHeader } from "@/components/app/dashboard/templates/app-dashboard-templates-header";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  { id: "1", title: "Pitch de startup", type: PresentationType.multi },
  { id: "2", title: "Arquitetura de sistema", type: PresentationType.single },
  { id: "3", title: "Roadmap de produto", type: PresentationType.multi },
];

export async function AppDashboardTemplates({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.dashboard.templates");

  return (
    <LayoutSection className="first:pt-10 md:first:pt-14 md:pb-16">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-dashboard-templates w-full max-w-4xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <AppDashboardTemplatesHeader />

          {ITEMS.length === 0 ? (
            <div className="app-dashboard-templates-empty">
              <Muted className="text-sm">{t("empty")}</Muted>
            </div>
          ) : (
            <div className="app-dashboard-templates-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ITEMS.map((item) => (
                <AppDashboardTemplatesCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                />
              ))}
            </div>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppDashboardCommunityCard } from "@/components/app/dashboard/community/app-dashboard-community-card";
import { AppDashboardCommunityHeader } from "@/components/app/dashboard/community/app-dashboard-community-header";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  { id: "1", title: "CI/CD com GitHub Actions", author: "Lucas M.", type: PresentationType.multi },
  { id: "2", title: "Fluxo de onboarding", author: "Ana P.", type: PresentationType.single },
  { id: "3", title: "Event sourcing com Kafka", author: "Rafael S.", type: PresentationType.multi },
];

export async function AppDashboardCommunity({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.dashboard.community");

  return (
    <LayoutSection className="first:pt-10 md:first:pt-14">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-dashboard-community w-full max-w-4xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <AppDashboardCommunityHeader />

          {ITEMS.length === 0 ? (
            <div className="app-dashboard-community-empty">
              <Muted className="text-sm">{t("empty")}</Muted>
            </div>
          ) : (
            <div className="app-dashboard-community-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ITEMS.map((item) => (
                <AppDashboardCommunityCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  author={item.author}
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

import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import {
  PresentationLanguage,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppDashboardRecentCard } from "@/components/app/dashboard/recents/app-dashboard-recent-card";
import { AppDashboardRecentsHeader } from "@/components/app/dashboard/recents/app-dashboard-recents-header";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  {
    id: "1",
    title: "Fluxo de autenticação com login social",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 8,
  },
  {
    id: "2",
    title: "Arquitetura de microsserviços com API gateway",
    type: PresentationType.single,
    language: PresentationLanguage.en,
    slideCount: 1,
  },
  {
    id: "3",
    title: "Roadmap Q3 — Produto e Entregas",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 12,
  },
];

export async function AppDashboardRecents({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.dashboard.recents");

  return (
    <LayoutSection className="first:pt-10 md:first:pt-14">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-dashboard-recents w-full max-w-4xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <AppDashboardRecentsHeader />

          {ITEMS.length === 0 ? (
            <div className="app-dashboard-recents-empty">
              <Muted className="text-sm">{t("empty")}</Muted>
            </div>
          ) : (
            <div className="app-dashboard-recents-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ITEMS.map((item) => (
                <AppDashboardRecentCard
                  key={item.id}
                  title={item.title}
                  type={item.type}
                  language={item.language}
                  slideCount={item.slideCount}
                  typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                  href={`/app/presentations/${item.id}/editor`}
                />
              ))}
            </div>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import { AppCommunityDuplicateModal } from "@/components/app/app-community-duplicate-modal";
import { AppDashboardCommunityHeader } from "@/components/app/dashboard/community/app-dashboard-community-header";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  { id: "1", title: "CI/CD com GitHub Actions", createdBy: "Lucas M.", type: PresentationType.multi, createdAtLabel: "há 3 dias" },
  { id: "2", title: "Fluxo de onboarding", createdBy: "Ana P.", type: PresentationType.single, createdAtLabel: "há 1 semana" },
  { id: "3", title: "Event sourcing com Kafka", createdBy: "Rafael S.", type: PresentationType.multi, createdAtLabel: "há 2 semanas" },
];

type CommunityItem = (typeof ITEMS)[number];

export function AppDashboardCommunity({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.dashboard.community");
  const [selected, setSelected] = useState<CommunityItem | null>(null);

  return (
    <>
      <LayoutSection className="first:pt-6 md:first:pt-8">
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
                  <AppPresentationCard
                    key={item.id}
                    title={item.title}
                    type={item.type}
                    typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                    createdAtLabel={item.createdAtLabel}
                    createdBy={item.createdBy}
                    actions={["share", "copyLink"]}
                    onSelect={() => setSelected(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </LayoutContainer>
      </LayoutSection>

      {selected && (
        <AppCommunityDuplicateModal
          open
          onOpenChange={(open) => !open && setSelected(null)}
          title={selected.title}
          typeLabel={t(`types.${TYPE_KEY[selected.type]}`)}
          createdAtLabel={selected.createdAtLabel}
          createdBy={selected.createdBy}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import { AppTemplateUseModal } from "@/components/app/app-template-use-modal";
import { AppDashboardTemplatesHeader } from "@/components/app/dashboard/templates/app-dashboard-templates-header";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  { id: "1", title: "Pitch de startup", type: PresentationType.multi, slideCount: 10, createdBy: "Next Excalidraw" },
  { id: "2", title: "Arquitetura de sistema", type: PresentationType.single, slideCount: 1, createdBy: "Next Excalidraw" },
  { id: "3", title: "Roadmap de produto", type: PresentationType.multi, slideCount: 8, createdBy: "Next Excalidraw" },
];

type TemplateItem = (typeof ITEMS)[number];

export function AppDashboardTemplates({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.dashboard.templates");
  const [selected, setSelected] = useState<TemplateItem | null>(null);

  return (
    <>
      <LayoutSection className="first:pt-6 md:first:pt-8 md:pb-16">
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
                  <AppPresentationCard
                    key={item.id}
                    title={item.title}
                    type={item.type}
                    typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                    slideCount={item.slideCount}
                    createdAtLabel="oficial"
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
        <AppTemplateUseModal
          open
          onOpenChange={(open) => !open && setSelected(null)}
          title={selected.title}
          typeLabel={t(`types.${TYPE_KEY[selected.type]}`)}
          slideCount={selected.slideCount}
          createdBy={selected.createdBy}
        />
      )}
    </>
  );
}

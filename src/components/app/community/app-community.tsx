"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import {
  AppCommunityModal,
  type CommunityModalItem,
} from "@/components/app/app-community-modal";
import { AppCommunityHeader } from "@/components/app/community/app-community-header";
import { AppCommunityToolbar } from "@/components/app/community/app-community-toolbar";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  { id: "1", title: "CI/CD com GitHub Actions", createdBy: "Lucas M.", type: PresentationType.multi, createdAtLabel: "há 3 dias" },
  { id: "2", title: "Fluxo de onboarding", createdBy: "Ana P.", type: PresentationType.single, createdAtLabel: "há 1 semana" },
  { id: "3", title: "Event sourcing com Kafka", createdBy: "Rafael S.", type: PresentationType.multi, createdAtLabel: "há 2 semanas" },
  { id: "4", title: "Design system com Figma", createdBy: "Carla T.", type: PresentationType.multi, createdAtLabel: "há 3 semanas" },
  { id: "5", title: "Arquitetura hexagonal", createdBy: "Bruno F.", type: PresentationType.single, createdAtLabel: "há 1 mês" },
  { id: "6", title: "Estratégia de testes", createdBy: "Marta L.", type: PresentationType.multi, createdAtLabel: "há 1 mês" },
];

export function AppCommunity({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.community");
  const [selected, setSelected] = useState<CommunityModalItem | null>(null);

  return (
    <>
      <LayoutSection className="md:pb-16">
        <LayoutContainer className="justify-center">
          <div
            className={cn(
              "app-community w-full max-w-4xl flex flex-col gap-4",
              className,
            )}
            {...props}
          >
            <AppCommunityHeader />
            <AppCommunityToolbar />

            {ITEMS.length === 0 ? (
              <div className="app-community-empty">
                <Muted className="text-sm">{t("empty.label")}</Muted>
              </div>
            ) : (
              <div className="app-community-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ITEMS.map((item) => {
                  const typeLabel = t(`types.${TYPE_KEY[item.type]}`);
                  return (
                    <AppPresentationCard
                      key={item.id}
                      title={item.title}
                      type={item.type}
                      typeLabel={typeLabel}
                      createdAtLabel={item.createdAtLabel}
                      createdBy={item.createdBy}
                      actions={["share", "copyLink"]}
                      onSelect={() =>
                        setSelected({
                          id: item.id,
                          title: item.title,
                          type: item.type,
                          typeLabel,
                          createdAtLabel: item.createdAtLabel,
                          createdBy: item.createdBy,
                        })
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </LayoutContainer>
      </LayoutSection>

      {selected && (
        <AppCommunityModal
          key={selected.id}
          open
          onOpenChange={(open) => !open && setSelected(null)}
          item={selected}
        />
      )}
    </>
  );
}

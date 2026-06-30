"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import {
  PresentationLanguage,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import {
  AppPresentationCard,
} from "@/components/app/app-presentation-card";
import {
  TRASH_VIEW_ACTIONS,
} from "@/components/app/app-presentation-card-actions";
import { AppPresentationsEmpty } from "@/components/app/presentations/app-presentations-empty";
import { AppPresentationsHeader } from "@/components/app/presentations/app-presentations-header";
import { AppPresentationsToolbar } from "@/components/app/presentations/app-presentations-toolbar";
import { AppPresentationsTrashToolbar } from "@/components/app/presentations/app-presentations-trash-toolbar";

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
    createdAtLabel: "há 2 dias",
    createdBy: "Alex C.",
    isFavorited: true,
  },
  {
    id: "2",
    title: "Arquitetura de microsserviços com API gateway",
    type: PresentationType.single,
    language: PresentationLanguage.en,
    slideCount: 1,
    createdAtLabel: "há 5 dias",
    createdBy: "Alex C.",
    isFavorited: false,
  },
  {
    id: "3",
    title: "Roadmap Q3 — Produto e Entregas",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 12,
    createdAtLabel: "há 1 semana",
    createdBy: "Alex C.",
    isFavorited: false,
  },
];

const TRASH_ITEMS = [
  {
    id: "t1",
    title: "Apresentação antiga de onboarding",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 5,
    createdAtLabel: "há 3 semanas",
    createdBy: "Alex C.",
  },
  {
    id: "t2",
    title: "Demo descontinuada — v0.1",
    type: PresentationType.single,
    language: PresentationLanguage.en,
    slideCount: 1,
    createdAtLabel: "há 1 mês",
    createdBy: "Alex C.",
  },
];

export function AppPresentations({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.presentations");
  const [isTrashView, setIsTrashView] = useState(false);

  const visibleItems = isTrashView ? TRASH_ITEMS : ITEMS;
  const trashCount = TRASH_ITEMS.length;

  return (
    <LayoutSection className="md:pb-16">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-presentations w-full max-w-4xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <AppPresentationsHeader
            trashCount={trashCount}
            isTrashView={isTrashView}
            onTrashToggle={() => setIsTrashView((v) => !v)}
          />

          {isTrashView ? (
            <AppPresentationsTrashToolbar />
          ) : (
            <AppPresentationsToolbar />
          )}

          {visibleItems.length === 0 ? (
            <AppPresentationsEmpty />
          ) : (
            <div className="app-presentations-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <AppPresentationCard
                  key={item.id}
                  title={item.title}
                  type={item.type}
                  language={item.language}
                  slideCount={item.slideCount}
                  typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                  href={isTrashView ? "#" : `/app/presentations/${item.id}/studio`}
                  createdAtLabel={item.createdAtLabel}
                  createdBy={item.createdBy}
                  isFavorited={Boolean((item as any).isFavorited)}
                  actions={isTrashView ? TRASH_VIEW_ACTIONS : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

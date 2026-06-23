import { getTranslations } from "next-intl/server";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import {
  PresentationLanguage,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import { AppPresentationsEmpty } from "@/components/app/presentations/app-presentations-empty";
import { AppPresentationsHeader } from "@/components/app/presentations/app-presentations-header";
import { AppPresentationsToolbar } from "@/components/app/presentations/app-presentations-toolbar";

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
  },
  {
    id: "2",
    title: "Arquitetura de microsserviços com API gateway",
    type: PresentationType.single,
    language: PresentationLanguage.en,
    slideCount: 1,
    createdAtLabel: "há 5 dias",
    createdBy: "Alex C.",
  },
  {
    id: "3",
    title: "Roadmap Q3 — Produto e Entregas",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 12,
    createdAtLabel: "há 1 semana",
    createdBy: "Alex C.",
  },
];

export async function AppPresentations({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = await getTranslations("app.presentations");

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
          <AppPresentationsHeader />
          <AppPresentationsToolbar />

          {ITEMS.length === 0 ? (
            <AppPresentationsEmpty />
          ) : (
            <div className="app-presentations-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ITEMS.map((item) => (
                <AppPresentationCard
                  key={item.id}
                  title={item.title}
                  type={item.type}
                  language={item.language}
                  slideCount={item.slideCount}
                  typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                  href={`/app/presentations/${item.id}/studio`}
                  createdAtLabel={item.createdAtLabel}
                  createdBy={item.createdBy}
                />
              ))}
            </div>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

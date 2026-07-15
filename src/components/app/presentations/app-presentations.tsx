"use client";

import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
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
import { useAppPresentationsList } from "@/providers/app/app-presentations-list-provider";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

export function AppPresentations({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.presentations");
  const { items, trashItems, isTrashView, onMoveToTrash } = useAppPresentationsList();

  const visibleItems = isTrashView ? trashItems : items;

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
                  isFavorited={item.isFavorited}
                  actions={isTrashView ? TRASH_VIEW_ACTIONS : undefined}
                  onTrashConfirm={isTrashView ? undefined : () => onMoveToTrash(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

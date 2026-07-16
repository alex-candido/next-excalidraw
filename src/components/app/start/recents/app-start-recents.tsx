"use client";

import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";
import { useAppPresentationsList } from "@/providers/app/app-presentations-list-provider";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import { AppPresentationCardSkeleton } from "@/components/app/app-presentation-card-skeleton";
import { AppStartRecentsHeader } from "@/components/app/start/recents/app-start-recents-header";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const RECENTS_LIMIT = 6;
const SKELETON_COUNT = 3;

export function AppStartRecents({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.start.recents");
  const { items, isLoading, onMoveToTrash, onRename, onDuplicate } = useAppPresentationsList();
  const recentItems = items.slice(0, RECENTS_LIMIT);

  return (
    <LayoutSection className="first:pt-6 md:first:pt-8 md:pb-16">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-start-recents w-full max-w-4xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <AppStartRecentsHeader />

          {isLoading ? (
            <div className="app-start-recents-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <AppPresentationCardSkeleton key={i} />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="app-start-recents-empty">
              <Muted className="text-sm">{t("empty")}</Muted>
            </div>
          ) : (
            <div className="app-start-recents-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentItems.map((item) => (
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
                  isFavorited={item.isFavorited}
                  thumbnail={item.thumbnail}
                  onTrashConfirm={() => onMoveToTrash(item.id)}
                  onRenameConfirm={(title) => onRename(item.id, title)}
                  onDuplicate={() => onDuplicate(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

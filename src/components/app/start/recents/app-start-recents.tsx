"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { routing } from "@/i18n/routing";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";
import { toListItem } from "@/providers/app/app-presentations-list-provider";

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
  const { lang } = useParams<{ lang?: string }>();
  // Widget independente do estado de filtro/busca de `/app/presentations` —
  // sempre "todas" as presentations mais recentes, não o que a tab/busca da
  // outra page estiver mostrando (mesmo provider global, escopos diferentes).
  const { useList, useMoveToTrash, useRename, useDuplicate, useFavorite, useUnfavorite } = useAppPresentation();
  const { data, isLoading } = useList({ tab: "all" });
  const moveToTrash = useMoveToTrash();
  const rename = useRename();
  const duplicate = useDuplicate();
  const favorite = useFavorite();
  const unfavorite = useUnfavorite();

  const items = (data?.pages.flatMap((page) => page.presentations) ?? []).map((p) =>
    toListItem(p, lang ?? routing.defaultLocale),
  );
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
                  onTrashConfirm={() => moveToTrash.mutate(item.id)}
                  onRenameConfirm={(title) => rename.mutate({ id: item.id, title })}
                  onDuplicate={() => duplicate.mutate(item.id)}
                  onToggleFavorite={() =>
                    item.isFavorited ? unfavorite.mutate(item.id) : favorite.mutate(item.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

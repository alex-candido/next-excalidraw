"use client";

import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { LAYOUT_HEADER_HEIGHT_PX } from "@/components/layouts/layout-header";
import { Button } from "@/components/ui/button";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn, scrollToElement } from "@/lib/utils";

import {
  AppPresentationCard,
} from "@/components/app/app-presentation-card";
import {
  TRASH_VIEW_ACTIONS,
} from "@/components/app/app-presentation-card-actions";
import { AppPresentationCardSkeleton } from "@/components/app/app-presentation-card-skeleton";
import { AppPresentationsEmpty } from "@/components/app/presentations/app-presentations-empty";
import { AppPresentationsTrashToolbar } from "@/components/app/presentations/app-presentations-trash-toolbar";
import { useAppPresentationsList } from "@/providers/app/app-presentations-list-provider";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

// Mesmo tamanho da página do servidor (LIST_PAGE_SIZE_DEFAULT) — o skeleton
// deve sugerir "quantos itens vêm", não um número arbitrário.
const SKELETON_COUNT = 9;

const TOP_ANCHOR_ID = "app-presentations-top";

export function AppPresentations({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.presentations");
  const tActions = useTranslations("app.presentations.list");
  const {
    visibleItems,
    isLoading,
    filter,
    search,
    visibilityFilter,
    isFetchingNextPage,
    hasNextPage,
    hasLoadedMore,
    onLoadMore,
    onMoveToTrash,
    onRestore,
    onDeletePermanently,
    onFavorite,
    onUnfavorite,
    onRestoreAll,
    onEmptyTrash,
    onRename,
    onDuplicate,
  } = useAppPresentationsList();
  const isTrashView = filter === "trash";

  // "Todas" sem busca/visibilidade ativa é o escopo mais amplo possível —
  // zero resultado aí significa que a conta não tem presentation nenhuma.
  // Qualquer outro filtro com zero resultado é "não achou dentro do escopo",
  // não "não existe nada" (ver app-presentations-empty.tsx).
  const isBroadestScope = filter === "all" && !search.trim() && visibilityFilter === "all";

  function scrollToTop() {
    scrollToElement(TOP_ANCHOR_ID, { offsetPx: LAYOUT_HEADER_HEIGHT_PX, gapRatio: 0.40 });
  }

  return (
    <LayoutSection className="pt-0! md:pb-16">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-presentations relative w-full max-w-4xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          {/* absolute, não flex item — senão o gap-4 do container cria um
              espaço vazio antes do primeiro elemento real (era só um alvo de
              scroll sem conteúdo, o gap tratava ele como item normal). */}
          <div id={TOP_ANCHOR_ID} className="absolute top-0" />

          {isTrashView && (
            <AppPresentationsTrashToolbar
              onRestoreAll={onRestoreAll}
              onEmptyTrash={onEmptyTrash}
            />
          )}

          {isLoading ? (
            <div className="app-presentations-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <AppPresentationCardSkeleton key={i} />
              ))}
            </div>
          ) : visibleItems.length === 0 ? (
            <AppPresentationsEmpty variant={isBroadestScope ? "no-data" : "no-results"} />
          ) : (
            <>
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
                    thumbnail={item.thumbnail}
                    actions={isTrashView ? TRASH_VIEW_ACTIONS : undefined}
                    onTrashConfirm={isTrashView ? undefined : () => onMoveToTrash(item.id)}
                    onRenameConfirm={isTrashView ? undefined : (title) => onRename(item.id, title)}
                    onDuplicate={isTrashView ? undefined : () => onDuplicate(item.id)}
                    onRestore={isTrashView ? () => onRestore(item.id) : undefined}
                    onDeletePermanentlyConfirm={isTrashView ? () => onDeletePermanently(item.id) : undefined}
                    onToggleFavorite={() => (item.isFavorited ? onUnfavorite(item.id) : onFavorite(item.id))}
                  />
                ))}
              </div>

              {(hasNextPage || hasLoadedMore) && (
                <div className="app-presentations-pagination flex items-center justify-center gap-2 pt-2">
                  {hasNextPage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLoadMore}
                      disabled={isFetchingNextPage}
                      className="app-presentations-load-more"
                    >
                      {isFetchingNextPage ? tActions("loadingMore") : tActions("loadMore")}
                    </Button>
                  )}
                  {hasLoadedMore && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={scrollToTop}
                      className="app-presentations-scroll-top gap-1.5"
                    >
                      <ArrowUp className="size-3.5" />
                      {tActions("backToTop")}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}

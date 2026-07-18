"use client";

import { useParams } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { routing } from "@/i18n/routing";
import {
  PresentationLanguage,
  PresentationType,
  PresentationVisibility,
} from "@/lib/drizzle/schema/presentation";
import { formatRelativeDate } from "@/lib/utils";
import type { Presentation } from "@/schemas/app/presentation-schema";

export interface AppPresentationsListItem {
  id: string;
  title: string;
  type: (typeof PresentationType)[keyof typeof PresentationType];
  language: (typeof PresentationLanguage)[keyof typeof PresentationLanguage];
  visibility: (typeof PresentationVisibility)[keyof typeof PresentationVisibility];
  slideCount: number;
  createdAt: string;
  createdAtLabel: string;
  createdBy: string;
  isFavorited: boolean;
  thumbnail: string | null;
}

export type AppPresentationsFilter =
  | "all"
  | "recent"
  | "multi"
  | "single"
  | "favorites"
  | "trash";

export type AppPresentationsVisibilityFilter = "all" | "public" | "private";

const SEARCH_DEBOUNCE_MS = 300;

interface AppPresentationsListContextProps {
  visibleItems: AppPresentationsListItem[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  hasLoadedMore: boolean;
  onLoadMore: () => void;
  trashCount: number;
  favoritesCount: number;
  filter: AppPresentationsFilter;
  onFilterChange: (filter: AppPresentationsFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  visibilityFilter: AppPresentationsVisibilityFilter;
  onVisibilityFilterChange: (visibility: AppPresentationsVisibilityFilter) => void;
  onMoveToTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onFavorite: (id: string) => void;
  onUnfavorite: (id: string) => void;
  onRestoreAll: () => void;
  onEmptyTrash: () => void;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
}

const AppPresentationsListContext = createContext<AppPresentationsListContextProps | undefined>(undefined);

// Exportado — `AppStartRecents`/`AppPresentationsSearch` buscam a lista sem
// passar pelo estado de filtro desta page (precisam do topo geral, não do
// que a tab/busca de `/app/presentations` está mostrando agora) mas reusam o
// mesmo mapeamento de item.
export function toListItem(p: Presentation, lang: string): AppPresentationsListItem {
  return {
    id: p.id,
    title: p.title || "Untitled",
    type: p.entry.type as AppPresentationsListItem["type"],
    language: p.entry.language as AppPresentationsListItem["language"],
    visibility: p.visibility as AppPresentationsListItem["visibility"],
    slideCount: p.entry.slideCount,
    createdAt: p.createdAt,
    createdAtLabel: formatRelativeDate(p.createdAt, lang),
    // Sem infra de nome de usuário ainda (só temos userId) — gap conhecido, ver pm.md Backlog.
    createdBy: "",
    isFavorited: p.isFavorited,
    thumbnail: p.thumbnail,
  };
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

export const AppPresentationsListProvider = ({ children }: { children: ReactNode }) => {
  const { lang } = useParams<{ lang?: string }>();
  const {
    useList,
    useTrashCount,
    useFavoritesCount,
    useMoveToTrash,
    useRestore,
    useDeletePermanently,
    useFavorite,
    useUnfavorite,
    useRestoreAll,
    useEmptyTrash,
    useRename,
    useDuplicate,
  } = useAppPresentation();

  const [filter, setFilter] = useState<AppPresentationsFilter>("all");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<AppPresentationsVisibilityFilter>("all");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  // Tabs = escopo (traduzido pro `tab` da query no servidor); busca e
  // visibilidade refinam dentro desse escopo, viram query params também —
  // nada disso filtra em memória mais, quem filtra é o `presentationService().list()`.
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useList({
    tab: filter,
    visibility: visibilityFilter === "all" ? undefined : visibilityFilter,
    q: debouncedSearch.trim() || undefined,
  });
  const { data: trashCountData } = useTrashCount();
  const { data: favoritesCountData } = useFavoritesCount();

  const moveToTrash = useMoveToTrash();
  const restore = useRestore();
  const deletePermanently = useDeletePermanently();
  const favorite = useFavorite();
  const unfavorite = useUnfavorite();
  const restoreAll = useRestoreAll();
  const emptyTrash = useEmptyTrash();
  const rename = useRename();
  const duplicate = useDuplicate();

  const visibleItems = (data?.pages.flatMap((page) => page.presentations) ?? []).map((p) =>
    toListItem(p, lang ?? routing.defaultLocale),
  );

  const value: AppPresentationsListContextProps = {
    visibleItems,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    // Só true depois que "carregar mais" já trouxe pelo menos 1 página extra —
    // "voltar ao topo" não faz sentido numa lista que ainda cabe na primeira página.
    hasLoadedMore: (data?.pages.length ?? 0) > 1,
    onLoadMore: () => fetchNextPage(),
    trashCount: trashCountData?.count ?? 0,
    favoritesCount: favoritesCountData?.count ?? 0,
    filter,
    onFilterChange: setFilter,
    search,
    onSearchChange: setSearch,
    visibilityFilter,
    onVisibilityFilterChange: setVisibilityFilter,
    onMoveToTrash: (id: string) => moveToTrash.mutate(id),
    onRestore: (id: string) => restore.mutate(id),
    onDeletePermanently: (id: string) => deletePermanently.mutate(id),
    onFavorite: (id: string) => favorite.mutate(id),
    onUnfavorite: (id: string) => unfavorite.mutate(id),
    onRestoreAll: () => restoreAll.mutate(),
    onEmptyTrash: () => emptyTrash.mutate(),
    onRename: (id: string, title: string) => rename.mutate({ id, title }),
    onDuplicate: (id: string) => duplicate.mutate(id),
  };

  return (
    <AppPresentationsListContext.Provider value={value}>
      {children}
    </AppPresentationsListContext.Provider>
  );
};

export const useAppPresentationsList = () => {
  const context = useContext(AppPresentationsListContext);
  if (context === undefined) {
    throw new Error("useAppPresentationsList must be used within an AppPresentationsListProvider");
  }
  return context;
};

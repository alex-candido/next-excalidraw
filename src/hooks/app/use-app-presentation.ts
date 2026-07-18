"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { presentationActions, type PresentationListParams } from "@/actions/app/app-presentation-actions";
import { appMetricsKeys } from "@/hooks/app/use-app-metrics";
import type { PresentationWithOutlines } from "@/schemas/app/presentation-schema";

export type PresentationListFilters = Omit<PresentationListParams, "cursor" | "limit">;

export const appPresentationKeys = {
  all: ["presentations"] as const,
  list: (filters: PresentationListFilters) => ["presentations", "list", filters] as const,
  trashCount: ["presentations", "trashCount"] as const,
  favoritesCount: ["presentations", "favoritesCount"] as const,
  detail: (id: string) => ["presentations", id] as const,
};

type RefetchInterval = number | false | ((data: PresentationWithOutlines | undefined) => number | false);

export function useAppPresentation() {
  const queryClient = useQueryClient();

  // useInfiniteQuery, não useQuery — cada tab/busca/visibilidade é uma query
  // paginada própria (a key inclui `filters`), "carregar mais" chama
  // fetchNextPage() em vez de recalcular filtro em memória (ver
  // pm/decisions.md, paginação por cursor).
  function useList(filters: PresentationListFilters = {}) {
    return useInfiniteQuery({
      queryKey: appPresentationKeys.list(filters),
      queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
        presentationActions().list({ ...filters, cursor: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
  }

  function useTrashCount() {
    return useQuery({
      queryKey: appPresentationKeys.trashCount,
      queryFn: () => presentationActions().trashCount(),
    });
  }

  function useFavoritesCount() {
    return useQuery({
      queryKey: appPresentationKeys.favoritesCount,
      queryFn: () => presentationActions().favoritesCount(),
    });
  }

  function useDetail(id: string, options?: { refetchInterval?: RefetchInterval }) {
    const refetchInterval = options?.refetchInterval;

    return useQuery({
      queryKey: appPresentationKeys.detail(id),
      queryFn: () => presentationActions().findById(id),
      enabled: !!id,
      refetchInterval: typeof refetchInterval === "function"
        ? (query) => refetchInterval(query.state.data)
        : refetchInterval,
    });
  }

  function useCreate() {
    return useMutation({
      mutationFn: presentationActions().create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
        queryClient.invalidateQueries({ queryKey: appMetricsKeys.all });
      },
    });
  }

  function useMoveToTrash() {
    return useMutation({
      mutationFn: presentationActions().moveToTrash,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
      },
    });
  }

  function useRestore() {
    return useMutation({
      mutationFn: presentationActions().restore,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
      },
    });
  }

  function useDeletePermanently() {
    return useMutation({
      mutationFn: presentationActions().deletePermanently,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
        queryClient.invalidateQueries({ queryKey: appMetricsKeys.all });
      },
    });
  }

  function useFavorite() {
    return useMutation({
      mutationFn: presentationActions().favorite,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
      },
    });
  }

  function useUnfavorite() {
    return useMutation({
      mutationFn: presentationActions().unfavorite,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
      },
    });
  }

  function useRestoreAll() {
    return useMutation({
      mutationFn: presentationActions().restoreAll,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
      },
    });
  }

  function useEmptyTrash() {
    return useMutation({
      mutationFn: presentationActions().emptyTrash,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
        queryClient.invalidateQueries({ queryKey: appMetricsKeys.all });
      },
    });
  }

  function useRename() {
    return useMutation({
      mutationFn: ({ id, title }: { id: string; title: string }) => presentationActions().rename(id, { title }),
      onSuccess: (_data, { id }) => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.detail(id) });
      },
    });
  }

  function useDuplicate() {
    return useMutation({
      mutationFn: presentationActions().duplicate,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
        queryClient.invalidateQueries({ queryKey: appMetricsKeys.all });
      },
    });
  }

  function useGenerateOutline(id: string) {
    return useMutation({
      mutationFn: presentationActions().generateOutline.bind(null, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.detail(id) });
      },
    });
  }

  return {
    useList,
    useTrashCount,
    useFavoritesCount,
    useDetail,
    useCreate,
    useMoveToTrash,
    useRestore,
    useDeletePermanently,
    useFavorite,
    useUnfavorite,
    useRestoreAll,
    useEmptyTrash,
    useRename,
    useDuplicate,
    useGenerateOutline,
  };
}

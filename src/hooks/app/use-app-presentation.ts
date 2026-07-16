"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { presentationActions } from "@/actions/app/app-presentation-actions";
import type { PresentationWithOutlines } from "@/schemas/app/presentation-schema";

export const appPresentationKeys = {
  all: ["presentations"] as const,
  detail: (id: string) => ["presentations", id] as const,
};

type RefetchInterval = number | false | ((data: PresentationWithOutlines | undefined) => number | false);

export function useAppPresentation() {
  const queryClient = useQueryClient();

  function useList() {
    return useQuery({
      queryKey: appPresentationKeys.all,
      queryFn: () => presentationActions().list(),
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

  return { useList, useDetail, useCreate, useMoveToTrash, useRename, useDuplicate, useGenerateOutline };
}

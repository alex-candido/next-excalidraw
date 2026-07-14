"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { presentationActions } from "@/actions/app/app-presentation-actions";

export const appPresentationKeys = {
  all: ["presentations"] as const,
  detail: (id: string) => ["presentations", id] as const,
};

export function useAppPresentation() {
  const queryClient = useQueryClient();

  function useList() {
    return useQuery({
      queryKey: appPresentationKeys.all,
      queryFn: () => presentationActions().list(),
    });
  }

  function useDetail(id: string) {
    return useQuery({
      queryKey: appPresentationKeys.detail(id),
      queryFn: () => presentationActions().findById(id),
      enabled: !!id,
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

  function useRemove() {
    return useMutation({
      mutationFn: presentationActions().remove,
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

  return { useList, useDetail, useCreate, useRemove, useGenerateOutline };
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { slideActions } from "@/actions/app/app-slide-actions";
import type { Slide, SlideRegenerate } from "@/schemas/app/slide-schema";

export const appSlideKeys = {
  all: (presentationId: string) => ["slides", presentationId] as const,
};

type RefetchInterval = number | false | ((data: Slide[] | undefined) => number | false);

export function useAppSlide() {
  const queryClient = useQueryClient();

  function useList(presentationId: string, options?: { refetchInterval?: RefetchInterval }) {
    const refetchInterval = options?.refetchInterval;

    return useQuery({
      queryKey: appSlideKeys.all(presentationId),
      queryFn: () => slideActions().list(presentationId),
      enabled: !!presentationId,
      refetchInterval: typeof refetchInterval === "function"
        ? (query) => refetchInterval(query.state.data)
        : refetchInterval,
    });
  }

  function useGenerate(presentationId: string) {
    return useMutation({
      mutationFn: slideActions().generate.bind(null, presentationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appSlideKeys.all(presentationId) });
      },
    });
  }

  function useBulkUpdate(presentationId: string) {
    return useMutation({
      mutationFn: slideActions().bulkUpdate.bind(null, presentationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appSlideKeys.all(presentationId) });
      },
    });
  }

  function useRegenerate(presentationId: string) {
    return useMutation({
      mutationFn: ({ slideId, input }: { slideId: string; input: SlideRegenerate }) =>
        slideActions().regenerate(presentationId, slideId, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appSlideKeys.all(presentationId) });
      },
    });
  }

  return { useList, useGenerate, useBulkUpdate, useRegenerate };
}

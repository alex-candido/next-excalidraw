"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { slideActions } from "@/actions/app/app-slide-actions";
import type { SlideRegenerate } from "@/schemas/app/slide-schema";

export const appSlideKeys = {
  all: (presentationId: string) => ["slides", presentationId] as const,
};

export function useAppSlide() {
  const queryClient = useQueryClient();

  function useList(presentationId: string) {
    return useQuery({
      queryKey: appSlideKeys.all(presentationId),
      queryFn: () => slideActions().list(presentationId),
      enabled: !!presentationId,
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

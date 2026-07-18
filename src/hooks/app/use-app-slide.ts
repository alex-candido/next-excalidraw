"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { slideActions } from "@/actions/app/app-slide-actions";
import { appPresentationKeys } from "@/hooks/app/use-app-presentation";
import type { Slide, SlideBulkUpdate, SlideManualCreate, SlideRegenerate } from "@/schemas/app/slide-schema";

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

  function useCreateManual(presentationId: string) {
    return useMutation({
      mutationFn: (input: SlideManualCreate) => slideActions().createManual(presentationId, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appSlideKeys.all(presentationId) });
        // outlines vivem na query da presentation, não na de slides — sem
        // isso a próxima hidratação do Studio ainda veria `outlines: []`.
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.detail(presentationId) });
      },
    });
  }

  function useBulkUpdate(presentationId: string) {
    return useMutation({
      mutationFn: slideActions().bulkUpdate.bind(null, presentationId),
      onSuccess: (_data, variables: SlideBulkUpdate) => {
        queryClient.invalidateQueries({ queryKey: appSlideKeys.all(presentationId) });
        // A capa (slide.thumbnail) aparece no card da listagem/detail de
        // presentations — sem isso, salvar no Studio atualiza o banco mas o
        // card fora do Studio continua mostrando a thumbnail antiga até essa
        // query expirar sozinha (staleTime).
        if (variables.slides.some((s) => s.thumbnail)) {
          queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
        }
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

  return { useList, useGenerate, useCreateManual, useBulkUpdate, useRegenerate };
}

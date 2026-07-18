"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { outlineActions } from "@/actions/app/app-outline-actions";
import { appPresentationKeys } from "@/hooks/app/use-app-presentation";
import type { OutlineRegenerate, OutlineRegenerateAll } from "@/schemas/app/presentations/multi-schema";

export function useAppOutline() {
  const queryClient = useQueryClient();

  function useBulkUpdate(presentationId: string) {
    return useMutation({
      mutationFn: outlineActions().bulkUpdate.bind(null, presentationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.detail(presentationId) });
      },
    });
  }

  function useRegenerate(presentationId: string) {
    return useMutation({
      mutationFn: ({ outlineId, input }: { outlineId: string; input: OutlineRegenerate }) =>
        outlineActions().regenerate(presentationId, outlineId, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.detail(presentationId) });
      },
    });
  }

  function useRegenerateAll(presentationId: string) {
    return useMutation({
      mutationFn: (input: OutlineRegenerateAll) => outlineActions().regenerateAll(presentationId, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: appPresentationKeys.detail(presentationId) });
      },
    });
  }

  return { useBulkUpdate, useRegenerate, useRegenerateAll };
}

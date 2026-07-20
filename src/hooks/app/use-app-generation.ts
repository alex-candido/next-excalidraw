"use client";

import { useQuery } from "@tanstack/react-query";
import { generationActions } from "@/actions/app/app-generation-actions";
import type { GenerationStatusSummary } from "@/schemas/app/generation-schema";

export const appGenerationKeys = {
  status: (presentationId: string, type: "slide" | "outline") => ["generations", presentationId, type] as const,
};

type RefetchInterval = number | false | ((data: GenerationStatusSummary | undefined) => number | false);

export function useAppGeneration() {
  function useStatus(
    presentationId: string,
    type: "slide" | "outline",
    options?: { refetchInterval?: RefetchInterval },
  ) {
    const refetchInterval = options?.refetchInterval;

    return useQuery({
      queryKey: appGenerationKeys.status(presentationId, type),
      queryFn: () => generationActions().status(presentationId, type),
      enabled: !!presentationId,
      refetchInterval: typeof refetchInterval === "function"
        ? (query) => refetchInterval(query.state.data)
        : refetchInterval,
    });
  }

  return { useStatus };
}

"use client";

import { useEffect, useState } from "react";

import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { PresentationStatus } from "@/lib/drizzle/schema/presentation";
import { useOutlineStore } from "@/store/app-outline-store";

const POLL_INTERVAL_MS = 3000;

// Busca a presentation (com poll enquanto a geração inicial via IA ainda roda
// em background) e hidrata a store (store/app-outline-store.ts) 1x — daí pra
// frente outlines/prompt/params ficam só locais até o onGenerate persistir.
export function useAppOutlineHydration(presentationId: string) {
  const { useDetail } = useAppPresentation();

  const resetForPresentation = useOutlineStore((s) => s.resetForPresentation);
  const hydrate = useOutlineStore((s) => s.hydrate);
  const hasHydrated = useOutlineStore((s) => s.hasHydrated);

  useEffect(() => {
    resetForPresentation(presentationId);
  }, [presentationId, resetForPresentation]);

  const { data: presentation, isLoading } = useDetail(presentationId, {
    refetchInterval: (data) => {
      if (!hasHydrated && data && data.status === PresentationStatus.draft && data.outlines.length === 0) {
        return POLL_INTERVAL_MS;
      }
      return false;
    },
  });
  const isGeneratingInitial =
    !hasHydrated && !!presentation && presentation.status === PresentationStatus.draft && presentation.outlines.length === 0;

  useEffect(() => {
    if (!presentation || hasHydrated || isGeneratingInitial) return;

    const outlines = presentation.outlines.map((o) => ({
      id: o.id,
      order: o.order,
      type: o.type,
      title: o.title,
      description: o.description ?? "",
      concepts: o.concepts ?? [],
      representation: o.representation,
      layout: o.layout ?? "",
      updatedAt: o.updatedAt,
    }));

    hydrate(outlines, presentation.entry.prompt ?? "", {
      language: presentation.entry.language,
      aspectRatio: presentation.entry.aspectRatio,
      slideCount: presentation.entry.slideCount,
      audience: presentation.entry.audience,
      scenario: presentation.entry.scenario,
      amount: presentation.entry.amount,
      theme: presentation.entry.theme,
    });
  }, [presentation, hasHydrated, isGeneratingInitial, hydrate]);

  return { presentation, isLoading, isGeneratingInitial };
}

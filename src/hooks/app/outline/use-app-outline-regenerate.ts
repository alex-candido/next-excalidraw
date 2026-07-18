"use client";

import { useEffect, useRef } from "react";

import { useAppOutline } from "@/hooks/app/use-app-outline";
import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { useOutlineStore } from "@/store/app-outline-store";

const POLL_INTERVAL_MS = 3000;

// Regenerar individual/tudo, com rastreio ao vivo (regeneratingIds na store) —
// poll próprio (independente do de use-app-outline-hydration.ts, mas na mesma
// query key: TanStack Query dedupe os dois, cada hook só cuida da própria
// condição de quando pollar).
export function useAppOutlineRegenerate(presentationId: string) {
  const { useRegenerate, useRegenerateAll } = useAppOutline();
  const { useDetail } = useAppPresentation();
  const regenerate = useRegenerate(presentationId);
  const regenerateAll = useRegenerateAll(presentationId);

  // Regenerar 1 card usa o que está PERSISTIDO (presentation_entry), não o
  // rascunho do Hero — editar prompt/parâmetros sem clicar "Regenerar tudo"
  // não deve afetar nada (ver conversa 2026-07-18: só "Regenerar tudo" commita
  // o rascunho de verdade).
  const persistedPrompt = useOutlineStore((s) => s.persistedPrompt);
  const persistedLanguage = useOutlineStore((s) => s.persistedParams.language);
  const regeneratingIds = useOutlineStore((s) => s.regeneratingIds);
  const markRegenerating = useOutlineStore((s) => s.markRegenerating);
  const unmarkRegenerating = useOutlineStore((s) => s.unmarkRegenerating);
  const applyRegenerateResult = useOutlineStore((s) => s.applyRegenerateResult);
  const applyRegenerateAllResult = useOutlineStore((s) => s.applyRegenerateAllResult);
  const setIsRegeneratingAll = useOutlineStore((s) => s.setIsRegeneratingAll);
  const waitingSince = useRef<Map<string, string | undefined>>(new Map());

  const { data: presentation } = useDetail(presentationId, {
    refetchInterval: () => (regeneratingIds.size > 0 ? POLL_INTERVAL_MS : false),
  });

  // Enquanto algum outline está "regenerando", o poll acima refaz o fetch — aqui a gente
  // detecta se o updatedAt daquele outline específico mudou e só então aplica o resultado.
  useEffect(() => {
    if (!presentation || regeneratingIds.size === 0) return;

    for (const id of regeneratingIds) {
      const fresh = presentation.outlines.find((o) => o.id === id);
      if (!fresh) continue;

      const startedAt = waitingSince.current.get(id);
      if (fresh.updatedAt === startedAt) continue;

      waitingSince.current.delete(id);
      applyRegenerateResult(id, {
        title: fresh.title,
        description: fresh.description ?? "",
        concepts: fresh.concepts ?? [],
        representation: fresh.representation,
        layout: fresh.layout ?? "",
        updatedAt: fresh.updatedAt,
      });
    }
  }, [presentation, regeneratingIds, applyRegenerateResult]);

  const onRegenerateCard = async (id: string) => {
    const outline = useOutlineStore.getState().outlines.find((o) => o.id === id);
    if (!outline || outline.isLocal) return;

    waitingSince.current.set(id, outline.updatedAt);
    markRegenerating(id);

    try {
      await regenerate.mutateAsync({
        outlineId: id,
        input: { userPrompt: persistedPrompt, language: persistedLanguage, type: outline.type, order: outline.order },
      });
    } catch {
      waitingSince.current.delete(id);
      unmarkRegenerating(id);
    }
  };

  // Commita o rascunho do Hero (prompt+parâmetros) e recria o outline inteiro
  // — diferente do que era antes (loop de regenerar item por item, mesma
  // quantidade sempre). É 1 chamada síncrona só (rota já devolve o resultado
  // pronto), não precisa do mecanismo de poll usado no regenerate individual.
  const onRegenerateAll = async () => {
    setIsRegeneratingAll(true);
    try {
      const draftPrompt = useOutlineStore.getState().prompt;
      const draftParams = useOutlineStore.getState().params;

      const result = await regenerateAll.mutateAsync({
        userPrompt:  draftPrompt,
        language:    draftParams.language,
        aspectRatio: draftParams.aspectRatio,
        slideCount:  draftParams.slideCount,
        audience:    draftParams.audience,
        scenario:    draftParams.scenario,
        amount:      draftParams.amount,
        theme:       draftParams.theme,
      });

      applyRegenerateAllResult(
        result.outlines.map((o) => ({
          id: o.id,
          order: o.order,
          type: o.type,
          title: o.title,
          description: o.description ?? "",
          concepts: o.concepts ?? [],
          representation: o.representation,
          layout: o.layout ?? "",
        })),
        draftPrompt,
        draftParams,
      );
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  return { onRegenerateCard, onRegenerateAll };
}

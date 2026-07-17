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
  const { useRegenerate } = useAppOutline();
  const { useDetail } = useAppPresentation();
  const regenerate = useRegenerate(presentationId);

  // Lidos direto da store (não da presentation original do servidor) — o
  // usuário pode ter editado prompt/idioma no Hero antes de regenerar, e o
  // regenerate precisa usar o valor atual, não o que veio na 1ª hidratação.
  const prompt = useOutlineStore((s) => s.prompt);
  const language = useOutlineStore((s) => s.params.language);
  const regeneratingIds = useOutlineStore((s) => s.regeneratingIds);
  const markRegenerating = useOutlineStore((s) => s.markRegenerating);
  const unmarkRegenerating = useOutlineStore((s) => s.unmarkRegenerating);
  const applyRegenerateResult = useOutlineStore((s) => s.applyRegenerateResult);
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
        input: { userPrompt: prompt, language, type: outline.type, order: outline.order },
      });
    } catch {
      waitingSince.current.delete(id);
      unmarkRegenerating(id);
    }
  };

  const onRegenerateAll = async () => {
    setIsRegeneratingAll(true);
    try {
      const outlines = useOutlineStore.getState().outlines;
      await Promise.all(outlines.filter((o) => !o.isLocal).map((o) => onRegenerateCard(o.id)));
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  return { onRegenerateCard, onRegenerateAll };
}

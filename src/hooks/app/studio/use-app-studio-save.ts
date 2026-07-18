"use client";

import { useAppSlide } from "@/hooks/app/use-app-slide";
import { OutlineType } from "@/lib/drizzle/schema/outline";
import { renderSvgThumbnail } from "@/lib/excalidraw/serialize/svg-thumbnail";
import { useStudioStore } from "@/store/app-studio-store";
import type { PresentationWithOutlines } from "@/schemas/app/presentation-schema";

// Compartilhado com use-app-studio-hydration.ts (gatilho automático pós-
// hidratação, caso raro do usuário nunca ter clicado em "Salvar") — só
// calcula o SVG e devolve o texto; quem chama decide como persistir
// (aqui, junto do bulkUpdate; lá, via setThumbnail isolado).
export async function computeCoverThumbnail(elements: unknown, appState: unknown): Promise<string> {
  return renderSvgThumbnail(elements as never, appState as Record<string, unknown>);
}

export function useAppStudioSave(presentationId: string, presentation: PresentationWithOutlines | undefined) {
  const { useCreateManual, useBulkUpdate } = useAppSlide();
  const createManual = useCreateManual(presentationId);
  const bulkUpdate = useBulkUpdate(presentationId);

  const setIsSaving = useStudioStore((s) => s.setIsSaving);
  const captureActiveSlideElements = useStudioStore((s) => s.captureActiveSlideElements);
  const reconcileCreatedSlides = useStudioStore((s) => s.reconcileCreatedSlides);

  const onSave = async () => {
    captureActiveSlideElements();
    setIsSaving(true);
    try {
      let { slides, activeSlideId } = useStudioStore.getState();
      const { excalidrawApi } = useStudioStore.getState();
      const activeElements = excalidrawApi ? [...excalidrawApi.getSceneElements()] : undefined;

      const outlineTypeById = new Map(presentation?.outlines.map((o) => [o.id, o.type]) ?? []);

      // Slide adicionado no Studio (onAddSlide) fica só local até aqui — o
      // outline que ele precisa (FK obrigatória) é criado junto, no mesmo
      // request, decidido no servidor (cover se for o primeiro da presentation,
      // senão content). Só depois disso os ids deixam de ser de mentira.
      const localSlides = slides.filter((s) => s.isLocal);
      if (localSlides.length > 0) {
        const { created } = await createManual.mutateAsync({
          slides: localSlides.map((s) => ({ tempId: s.id, order: s.order, title: s.title })),
        });
        created.forEach((c) => outlineTypeById.set(c.outlineId, c.type));
        reconcileCreatedSlides(created);
        ({ slides, activeSlideId } = useStudioStore.getState());
      }

      // Capa = slide do outline type=cover (não é só o primeiro por posição,
      // embora na prática coincidam — a fonte de verdade é o type). O SVG é
      // calculado a partir dos MESMOS elements que vão ser persistidos abaixo
      // (activeElements se for o slide ativo, senão o que já está na store) —
      // nunca de uma leitura separada, pra nunca dessincronizar do conteúdo
      // real. Vai no mesmo bulkUpdate, não numa chamada à parte: ou salva
      // tudo junto, ou nada — sem risco de elements salvar e a capa não.
      const coverSlide = slides.find((s) => !s.isLocal && s.outlineId && outlineTypeById.get(s.outlineId) === OutlineType.cover);
      let coverThumbnail: string | undefined;

      if (coverSlide) {
        const coverElements = (coverSlide.id === activeSlideId ? activeElements : undefined) ?? coverSlide.scene.elements;
        if (coverElements && coverElements.length > 0) {
          coverThumbnail = await computeCoverThumbnail(coverElements, coverSlide.scene.appState)
            .catch((err) => {
              console.warn("Falha ao gerar thumbnail da capa:", err);
              return undefined;
            });
        }
      }

      const slidesToPersist = slides.filter((s) => !s.isLocal);
      if (slidesToPersist.length > 0) {
        await bulkUpdate.mutateAsync({
          slides: slidesToPersist.map((s) => ({
            id: s.id,
            elements: ((s.id === activeSlideId ? activeElements : undefined) ?? s.scene.elements) as unknown as Record<string, unknown>[],
            appState: s.scene.appState,
            ...(s.id === coverSlide?.id && coverThumbnail ? { thumbnail: coverThumbnail } : {}),
          })),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return { onSave };
}

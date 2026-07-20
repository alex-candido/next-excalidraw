"use client";

import { useAppSlide } from "@/hooks/app/use-app-slide";
import { OutlineType } from "@/lib/drizzle/schema/outline";
import { renderSvgThumbnail } from "@/lib/excalidraw/serialize/svg-thumbnail";
import { useStudioStore } from "@/store/app-studio-store";

// Compartilhado com use-app-studio-hydration.ts (gatilho automático pós-
// hidratação, caso raro do usuário nunca ter clicado em "Salvar") — só
// calcula o SVG e devolve o texto; quem chama decide como persistir
// (aqui, junto do bulkUpdate; lá, via setThumbnail isolado).
export async function computeCoverThumbnail(elements: unknown, appState: unknown): Promise<string> {
  return renderSvgThumbnail(elements as never, appState as Record<string, unknown>);
}

export function useAppStudioSave(presentationId: string) {
  const { useCreateManual, useBulkUpdate } = useAppSlide();
  const createManual = useCreateManual(presentationId);
  const bulkUpdate = useBulkUpdate(presentationId);

  const setIsSaving = useStudioStore((s) => s.setIsSaving);
  const captureActiveSlideElements = useStudioStore((s) => s.captureActiveSlideElements);
  const reconcileCreatedSlides = useStudioStore((s) => s.reconcileCreatedSlides);
  const clearDeletedSlideIds = useStudioStore((s) => s.clearDeletedSlideIds);

  const onSave = async () => {
    captureActiveSlideElements();
    setIsSaving(true);
    try {
      let { slides, activeSlideId } = useStudioStore.getState();
      const { excalidrawApi } = useStudioStore.getState();
      const activeElements = excalidrawApi ? [...excalidrawApi.getSceneElements()] : undefined;

      // Slide adicionado no Studio (onAddSlide) fica só local até aqui — o
      // outline que ele precisa (FK obrigatória) é criado junto, no mesmo
      // request. Só depois disso os ids deixam de ser de mentira.
      const localSlides = slides.filter((s) => s.isLocal);
      if (localSlides.length > 0) {
        const { created } = await createManual.mutateAsync({
          slides: localSlides.map((s) => ({ tempId: s.id, order: s.order, title: s.title })),
        });
        reconcileCreatedSlides(created);
        ({ slides, activeSlideId } = useStudioStore.getState());
      }

      // Capa = primeiro slide (outlineType é derivado da posição, ver
      // deriveSlideTypes em app-studio-store.ts — sempre correto a essa
      // altura, nenhuma mutação da store deixa passar sem recalcular). O SVG
      // é calculado a partir dos MESMOS elements que vão ser persistidos
      // abaixo (activeElements se for o slide ativo, senão o que já está na
      // store) — nunca de uma leitura separada, pra nunca dessincronizar do
      // conteúdo real. Vai no mesmo bulkUpdate, não numa chamada à parte: ou
      // salva tudo junto, ou nada — sem risco de elements salvar e a capa não.
      const coverSlide = slides.find((s) => s.outlineType === OutlineType.cover);
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
      const { deletedSlideIds } = useStudioStore.getState();
      const deletedIds = Array.from(deletedSlideIds);

      // Reorder e exclusão iam junto do mesmo request — ou o lote inteiro
      // salva (elements + order + exclusões), ou nada. Roda mesmo se
      // `slidesToPersist` estiver vazio, desde que haja algo pra apagar.
      if (slidesToPersist.length > 0 || deletedIds.length > 0) {
        await bulkUpdate.mutateAsync({
          slides: slidesToPersist.map((s) => ({
            id: s.id,
            order: s.order,
            elements: ((s.id === activeSlideId ? activeElements : undefined) ?? s.scene.elements) as unknown as Record<string, unknown>[],
            appState: s.scene.appState,
            ...(s.id === coverSlide?.id && coverThumbnail ? { thumbnail: coverThumbnail } : {}),
          })),
          ...(deletedIds.length > 0 ? { deletedIds } : {}),
        });
        clearDeletedSlideIds();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return { onSave };
}

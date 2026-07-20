"use client";

import { useAppSlide } from "@/hooks/app/use-app-slide";
import { renderSvgThumbnail } from "@/lib/excalidraw/serialize/svg-thumbnail";
import { useStudioStore } from "@/store/app-studio-store";

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

      // Todo slide não-ativo já tem `thumbnail` atualizada em memória desde a
      // última vez que o usuário saiu dele (ver onSelectSlide/
      // refreshSlideThumbnail em app-studio-store.ts) — só o ativo pode ter
      // mudado sem passar por lá ainda, então só ele é recalculado aqui,
      // a partir dos MESMOS elements que vão ser persistidos abaixo (nunca de
      // uma leitura separada, pra nunca dessincronizar do conteúdo real). A
      // capa continua sendo só o primeiro slide (outlineType derivado da
      // posição) — nenhum tratamento especial aqui, ela recebe thumbnail como
      // qualquer outro slide.
      let activeThumbnail: string | undefined;
      const activeSlide = slides.find((s) => s.id === activeSlideId);
      if (activeSlide && activeElements && activeElements.length > 0) {
        activeThumbnail = await renderSvgThumbnail(activeElements, activeSlide.scene.appState)
          .catch((err) => {
            console.warn("Falha ao gerar thumbnail do slide:", err);
            return undefined;
          });
      }

      const slidesToPersist = slides.filter((s) => !s.isLocal);
      const { deletedSlideIds } = useStudioStore.getState();
      const deletedIds = Array.from(deletedSlideIds);

      // Reorder e exclusão iam junto do mesmo request — ou o lote inteiro
      // salva (elements + order + exclusões), ou nada. Roda mesmo se
      // `slidesToPersist` estiver vazio, desde que haja algo pra apagar.
      if (slidesToPersist.length > 0 || deletedIds.length > 0) {
        await bulkUpdate.mutateAsync({
          slides: slidesToPersist.map((s) => {
            const thumbnail = s.id === activeSlideId ? activeThumbnail : s.thumbnail;
            return {
              id: s.id,
              order: s.order,
              elements: ((s.id === activeSlideId ? activeElements : undefined) ?? s.scene.elements) as unknown as Record<string, unknown>[],
              appState: s.scene.appState,
              ...(thumbnail ? { thumbnail } : {}),
            };
          }),
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

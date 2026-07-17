"use client";

import { useAppSlide } from "@/hooks/app/use-app-slide";
import { OutlineType } from "@/lib/drizzle/schema/outline";
import { useStudioStore } from "@/store/app-studio-store";
import type { PresentationWithOutlines } from "@/schemas/app/presentation-schema";

// Compartilhado com use-app-studio-hydration.ts (gatilho automático pós-
// hidratação) — os elements passados já são os que devem valer (ativos no
// canvas ou os salvos, dependendo de quem chama), essa função só exporta e sobe.
export async function uploadCoverThumbnail(presentationId: string, slideId: string, elements: unknown, appState: unknown) {
  const { exportToBlob } = await import("@excalidraw/excalidraw");
  const blob = await exportToBlob({
    elements: elements as never,
    appState: appState as never,
    files: null,
    mimeType: "image/png",
    maxWidthOrHeight: 400,
  });

  const formData = new FormData();
  formData.append("file", blob, "thumbnail.png");
  await fetch(`/api/v1/app/presentations/${presentationId}/slides/${slideId}/thumbnail`, {
    method: "POST",
    body: formData,
  });
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

      const slidesToPersist = slides.filter((s) => !s.isLocal);
      if (slidesToPersist.length > 0) {
        await bulkUpdate.mutateAsync({
          slides: slidesToPersist.map((s) => ({
            id: s.id,
            elements: ((s.id === activeSlideId ? activeElements : undefined) ?? s.scene.elements) as unknown as Record<string, unknown>[],
            appState: s.scene.appState,
          })),
        });
      }

      // Capa = slide do outline type=cover (não é só o primeiro por posição,
      // embora na prática coincidam — a fonte de verdade é o type). Gera a
      // thumbnail a partir dos elements reais que acabaram de ser salvos, não
      // bloqueia/derruba o save principal se falhar.
      const coverSlide = slides.find((s) => !s.isLocal && s.outlineId && outlineTypeById.get(s.outlineId) === OutlineType.cover);

      if (coverSlide) {
        const coverElements = (coverSlide.id === activeSlideId ? activeElements : undefined) ?? coverSlide.scene.elements;
        if (coverElements && coverElements.length > 0) {
          await uploadCoverThumbnail(presentationId, coverSlide.id, coverElements, coverSlide.scene.appState)
            .catch((err) => console.warn("Falha ao gerar thumbnail da capa:", err));
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return { onSave };
}

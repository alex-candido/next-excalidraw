"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAppPresentation, appPresentationKeys } from "@/hooks/app/use-app-presentation";
import { useAppSlide } from "@/hooks/app/use-app-slide";
import { computeCoverThumbnail } from "@/hooks/app/studio/use-app-studio-save";
import { slideActions } from "@/actions/app/app-slide-actions";
import { OutlineType } from "@/lib/drizzle/schema/outline";
import { SlideStatus } from "@/lib/drizzle/schema/slide";
import {
  type AppPresentationsStudioScene,
  type AppPresentationsStudioSlide,
  useStudioStore,
} from "@/store/app-studio-store";

const POLL_INTERVAL_MS = 3000;

function findCoverSlide(slides: AppPresentationsStudioSlide[], outlines: { id: string; type: number }[] | undefined) {
  const outlineTypeById = new Map(outlines?.map((o) => [o.id, o.type]) ?? []);
  return slides.find((s) => !s.isLocal && s.outlineId && outlineTypeById.get(s.outlineId) === OutlineType.cover);
}

export function useAppStudioHydration(presentationId: string) {
  const { useDetail } = useAppPresentation();
  const { useList } = useAppSlide();
  const queryClient = useQueryClient();

  const resetForPresentation = useStudioStore((s) => s.resetForPresentation);
  const hydrate = useStudioStore((s) => s.hydrate);
  const setStoreHasHydrated = useStudioStore((s) => s.setHasHydrated);

  // Estado local (não o da store) só controla quando parar de dar poll —
  // separado do `hasHydrated` da store (que é o que a UI lê pra saber se a
  // geração terminou), porque aqui precisa checar sincronamente dentro do
  // `refetchInterval` sem depender de re-render.
  const [hasHydrated, setHasHydrated] = useState(false);
  const serializeRef = useRef<((skeletons: unknown[]) => AppPresentationsStudioScene) | null>(null);
  const [isSerializerReady, setIsSerializerReady] = useState(false);

  // Presentation trocou (navegação sem reload, ex: lista -> studio de outra
  // presentation) — store é global, então precisa resetar manualmente (não
  // acontece sozinho como aconteceria com um useState de componente desmontado).
  useEffect(() => {
    resetForPresentation(presentationId);
    setHasHydrated(false);
  }, [presentationId, resetForPresentation]);

  const { data: presentation, isLoading: isLoadingPresentation } = useDetail(presentationId);
  // slideService().generate() cria os slides um de cada vez, em sequência —
  // usado só pra saber quando PARAR de dar poll (bateu a quantidade
  // esperada de outlines), não mais pra decidir se hidrata ou não: a
  // hidratação em si roda a cada poll, incremental (ver hydrate() na store).
  const expectedSlideCount = presentation?.outlines.length ?? 0;
  const { data: rawSlides, isLoading: isLoadingSlides } = useList(presentationId, {
    refetchInterval: (data) =>
      !hasHydrated && expectedSlideCount > 0 && (data?.length ?? 0) < expectedSlideCount
        ? POLL_INTERVAL_MS
        : false,
  });

  // convertToExcalidrawElements toca `window` na avaliação do módulo — import adiado
  // pra useEffect client-only, senão quebra SSR (o hook é chamado num provider
  // global, montado em providers/app/index.tsx).
  useEffect(() => {
    let isMounted = true;
    import("@/lib/excalidraw/serialize/skeleton-serializer").then(({ skeletonSerializer }) => {
      if (!isMounted) return;
      serializeRef.current = (skeletons) => skeletonSerializer().serialize(skeletons as never) as AppPresentationsStudioScene;
      setIsSerializerReady(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!rawSlides || !isSerializerReady || hasHydrated) return;

    const outlineTitleById = new Map(presentation?.outlines.map((o) => [o.id, o.title]) ?? []);
    const outlineTypeById = new Map(presentation?.outlines.map((o) => [o.id, o.type]) ?? []);
    const serialize = serializeRef.current;
    if (!serialize) return;

    // Hidrata com o que já existe agora — pode ser um subconjunto parcial
    // (slides ainda sendo gerados no servidor). hydrate() na store faz
    // merge (só adiciona os que faltam), então rodar isso de novo a cada
    // poll com a lista completa até aqui é seguro e não reseta nada.
    const hydratedBatch = rawSlides
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        order: s.order,
        title: outlineTitleById.get(s.outlineId) ?? "",
        thumbnail: s.thumbnail ?? undefined,
        isHidden: s.status === SlideStatus.inactive,
        scene: serialize((s.elements ?? []) as unknown[]),
        outlineId: s.outlineId,
        outlineType: outlineTypeById.get(s.outlineId),
      }));

    hydrate(hydratedBatch);

    const isComplete = expectedSlideCount === 0 || rawSlides.length >= expectedSlideCount;
    if (!isComplete) return;

    setHasHydrated(true);
    setStoreHasHydrated(true);

    // Cobre o caso de o usuário nunca clicar em "Salvar" (só olhar o Studio e
    // ir direto pra Apresentar, por exemplo) — sem isso a capa nunca seria
    // gerada. Só dispara se a capa ainda não tiver thumbnail (não repete a
    // cada vez que o Studio é aberto).
    const coverSlide = findCoverSlide(hydratedBatch, presentation?.outlines);
    if (coverSlide && !coverSlide.thumbnail && coverSlide.scene.elements.length > 0) {
      computeCoverThumbnail(coverSlide.scene.elements, coverSlide.scene.appState)
        .then((thumbnail) => slideActions().setThumbnail(presentationId, coverSlide.id, { thumbnail }))
        .then(() => queryClient.invalidateQueries({ queryKey: appPresentationKeys.all }))
        .catch((err) => console.warn("Falha ao gerar thumbnail da capa:", err));
    }
  }, [rawSlides, isSerializerReady, hasHydrated, expectedSlideCount, presentation, hydrate, setStoreHasHydrated, presentationId, queryClient]);

  return {
    presentation,
    isLoading: isLoadingPresentation || isLoadingSlides,
    expectedSlideCount,
  };
}

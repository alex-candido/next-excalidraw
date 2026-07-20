"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAppPresentation, appPresentationKeys } from "@/hooks/app/use-app-presentation";
import { useAppGeneration } from "@/hooks/app/use-app-generation";
import { useAppSlide } from "@/hooks/app/use-app-slide";
import { slideActions } from "@/actions/app/app-slide-actions";
import { OutlineType } from "@/lib/drizzle/schema/outline";
import { SlideStatus } from "@/lib/drizzle/schema/slide";
import { renderSvgThumbnail } from "@/lib/excalidraw/serialize/svg-thumbnail";
import type { GenerationStatusSummary } from "@/schemas/app/generation-schema";
import {
  type AppPresentationsStudioScene,
  useStudioStore,
} from "@/store/app-studio-store";

const POLL_INTERVAL_MS = 3000;

export function useAppStudioHydration(presentationId: string) {
  const { useDetail } = useAppPresentation();
  const { useList } = useAppSlide();
  const { useStatus } = useAppGeneration();
  const queryClient = useQueryClient();

  const resetForPresentation = useStudioStore((s) => s.resetForPresentation);
  const hydrate = useStudioStore((s) => s.hydrate);
  const setStoreHasHydrated = useStudioStore((s) => s.setHasHydrated);
  const setSlideThumbnail = useStudioStore((s) => s.setSlideThumbnail);

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
  const expectedSlideCount = presentation?.outlines.length ?? 0;

  // Contagem de slide continua o sinal principal — cobre presentation em
  // branco (seedBlankStructure) e slide manual (createManual), nenhum dos
  // dois passa pela tabela `generation` (só slideService().generate(), via
  // IA, cria linha lá). Status de geração é só um sinal EXTRA: destrava o
  // poll quando uma geração falha e a contagem nunca vai bater sozinha
  // (senão ficaria esperando pra sempre um slide que nunca vai chegar).
  const isGenerationResolved = (status: GenerationStatusSummary | undefined) =>
    !!status && status.total > 0 && status.pending === 0;

  const shouldKeepPolling = (rawSlideCount: number, status: GenerationStatusSummary | undefined) => {
    if (hasHydrated || expectedSlideCount === 0) return false;
    if (rawSlideCount >= expectedSlideCount) return false;
    return !isGenerationResolved(status);
  };

  const { data: slideGeneration } = useStatus(presentationId, "slide", {
    refetchInterval: (data) =>
      !hasHydrated && expectedSlideCount > 0 && !isGenerationResolved(data)
        ? POLL_INTERVAL_MS
        : false,
  });

  const { data: rawSlides, isLoading: isLoadingSlides } = useList(presentationId, {
    refetchInterval: (data) => (shouldKeepPolling(data?.length ?? 0, slideGeneration) ? POLL_INTERVAL_MS : false),
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
    const outlineRepresentationById = new Map(presentation?.outlines.map((o) => [o.id, o.representation]) ?? []);
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
        representation: outlineRepresentationById.get(s.outlineId),
      }));

    hydrate(hydratedBatch);

    const isComplete = expectedSlideCount === 0 || !shouldKeepPolling(rawSlides.length, slideGeneration);
    if (!isComplete) return;

    setHasHydrated(true);
    setStoreHasHydrated(true);

    // Slide recém-gerado pela IA nunca teve thumbnail calculada ainda (só
    // ganha uma quando o usuário troca de slide/salva no Studio, ver
    // refreshSlideThumbnail em app-studio-store.ts) — sem isso, quem nunca
    // clicar em "Salvar" (ex: vai direto pra Apresentar) veria a sidebar e o
    // card da presentation (capa) sempre em branco. Calcula 1x por slide,
    // aqui na conclusão da hidratação, nunca de novo depois.
    const slidesMissingThumbnail = hydratedBatch.filter((s) => !s.thumbnail && s.scene.elements.length > 0);
    for (const slide of slidesMissingThumbnail) {
      renderSvgThumbnail(slide.scene.elements, slide.scene.appState)
        .then((thumbnail) => {
          setSlideThumbnail(slide.id, thumbnail);
          return slideActions().setThumbnail(presentationId, slide.id, { thumbnail });
        })
        .then(() => {
          // Card da listagem/detail de presentations lê a thumbnail da capa —
          // só essa mudança precisa invalidar aquela query.
          if (slide.outlineType === OutlineType.cover) {
            queryClient.invalidateQueries({ queryKey: appPresentationKeys.all });
          }
        })
        .catch((err) => console.warn("Falha ao gerar thumbnail do slide:", err));
    }
  }, [rawSlides, isSerializerReady, hasHydrated, expectedSlideCount, presentation, hydrate, setStoreHasHydrated, setSlideThumbnail, presentationId, queryClient, slideGeneration]);

  return {
    presentation,
    isLoading: isLoadingPresentation || isLoadingSlides,
    expectedSlideCount,
  };
}

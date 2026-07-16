"use client";

import { useParams } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { useAppSlide } from "@/hooks/app/use-app-slide";
import { routing } from "@/i18n/routing";
import { OutlineType } from "@/lib/drizzle/schema/outline";
import { SlideStatus } from "@/lib/drizzle/schema/slide";
import { formatRelativeDate } from "@/lib/utils";
import {
  type AppPresentationsStudioScene,
  type AppPresentationsStudioSlide,
  useStudioStore,
} from "@/store/app-studio-store";

function findCoverSlide(slides: AppPresentationsStudioSlide[], outlines: { id: string; type: number }[] | undefined) {
  const outlineTypeById = new Map(outlines?.map((o) => [o.id, o.type]) ?? []);
  return slides.find((s) => !s.isLocal && s.outlineId && outlineTypeById.get(s.outlineId) === OutlineType.cover);
}

// Compartilhado entre o save manual e a geração automática pós-hidratação —
// os elements passados já são os que devem valer (ativos no canvas ou os
// salvos, dependendo de quem chama), essa função só exporta e sobe.
async function uploadCoverThumbnail(presentationId: string, slideId: string, elements: unknown, appState: unknown) {
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

export type {
  AppPresentationsStudioScene,
  AppPresentationsStudioSlide,
  StudioPanelKey,
} from "@/store/app-studio-store";
export {
  useStudioActions,
  useStudioActivePanel,
  useStudioActiveSlide,
  useStudioActiveSlideId,
  useStudioIsSaving,
  useStudioIsWaitingSlides,
  useStudioSlides,
} from "@/store/app-studio-store";

const POLL_INTERVAL_MS = 3000;

// Só os valores derivados do servidor que raramente mudam (1x por load da
// presentation, não a cada edição) — o estado de edição em si (slides,
// activeSlideId, painel, etc.) vive no Zustand (store/app-studio-store.ts),
// que dá subscription seletiva por slice em vez de re-renderizar tudo a cada
// mudança, como Context faria. Ver docs/sdd/1-product/pm/decisions.md.
type AppPresentationsStudioContextProps = {
  title: string;
  createdAtLabel: string;
  createdBy: string;
  isFavorited: boolean;
  isLoading: boolean;
  onSave: () => void;
};

const AppPresentationsStudioContext = createContext<AppPresentationsStudioContextProps | undefined>(undefined);

export const useAppPresentationsStudio = () => {
  const context = useContext(AppPresentationsStudioContext);
  if (context === undefined) {
    throw new Error("useAppPresentationsStudio must be used within an AppPresentationsStudioProvider");
  }
  return context;
};

export const AppPresentationsStudioProvider = ({ children }: { children: ReactNode }) => {
  const routeParams = useParams<{ id?: string; lang?: string }>();
  const presentationId = routeParams.id ?? "";
  const lang = routeParams.lang ?? routing.defaultLocale;

  const { useDetail } = useAppPresentation();
  const { useList, useCreateManual, useBulkUpdate } = useAppSlide();

  const resetForPresentation = useStudioStore((s) => s.resetForPresentation);
  const hydrate = useStudioStore((s) => s.hydrate);
  const setIsSaving = useStudioStore((s) => s.setIsSaving);
  const captureActiveSlideElements = useStudioStore((s) => s.captureActiveSlideElements);
  const reconcileCreatedSlides = useStudioStore((s) => s.reconcileCreatedSlides);

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
  // slideService().generate() cria os slides um de cada vez, em sequência — não dá pra
  // considerar "terminou" só porque achou 1+ slide, senão hidrata cedo demais e ignora
  // os que ainda estão sendo persistidos. Espera bater com a quantidade de outlines.
  const expectedSlideCount = presentation?.outlines.length ?? 0;
  const { data: rawSlides, isLoading: isLoadingSlides } = useList(presentationId, {
    refetchInterval: (data) =>
      !hasHydrated && expectedSlideCount > 0 && (data?.length ?? 0) < expectedSlideCount
        ? POLL_INTERVAL_MS
        : false,
  });
  const createManual = useCreateManual(presentationId);
  const bulkUpdate = useBulkUpdate(presentationId);

  // convertToExcalidrawElements toca `window` na avaliação do módulo — import adiado
  // pra useEffect client-only, senão quebra SSR (provider é global, montado em providers/app/index.tsx).
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
    // Ainda esperando a geração inicial terminar (poll continua) — não hidrata com
    // um subconjunto parcial dos slides.
    if (expectedSlideCount > 0 && rawSlides.length < expectedSlideCount) return;

    const outlineTitleById = new Map(presentation?.outlines.map((o) => [o.id, o.title]) ?? []);
    const serialize = serializeRef.current;
    if (!serialize) return;

    const hydrated = rawSlides
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
      }));

    hydrate(hydrated);
    setHasHydrated(true);

    // Cobre o caso de o usuário nunca clicar em "Salvar" (só olhar o Studio e
    // ir direto pra Apresentar, por exemplo) — sem isso a capa nunca seria
    // gerada. Só dispara se a capa ainda não tiver thumbnail (não repete a
    // cada vez que o Studio é aberto).
    const coverSlide = findCoverSlide(hydrated, presentation?.outlines);
    if (coverSlide && !coverSlide.thumbnail && coverSlide.scene.elements.length > 0) {
      uploadCoverThumbnail(presentationId, coverSlide.id, coverSlide.scene.elements, coverSlide.scene.appState)
        .catch((err) => console.warn("Falha ao gerar thumbnail da capa:", err));
    }
  }, [rawSlides, isSerializerReady, hasHydrated, presentation, hydrate, presentationId]);

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

  const value: AppPresentationsStudioContextProps = {
    title: presentation?.title ?? "",
    createdAtLabel: presentation ? formatRelativeDate(presentation.createdAt, lang) : "",
    createdBy: "",
    isFavorited: false,
    isLoading: isLoadingPresentation || isLoadingSlides,
    onSave,
  };

  return (
    <AppPresentationsStudioContext.Provider value={value}>
      {children}
    </AppPresentationsStudioContext.Provider>
  );
};

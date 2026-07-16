"use client";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { arrayMove } from "@dnd-kit/sortable";
import { useParams } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

import { useAppPresentation } from "@/hooks/app/use-app-presentation";
import { useAppSlide } from "@/hooks/app/use-app-slide";
import { routing } from "@/i18n/routing";
import { SlideStatus } from "@/lib/drizzle/schema/slide";
import { formatRelativeDate } from "@/lib/utils";

export interface AppPresentationsStudioScene {
  type: "excalidraw";
  version: number;
  source: string;
  elements: readonly ExcalidrawElement[];
  appState: { viewBackgroundColor: string; gridSize: number };
  files: Record<string, never>;
}

export interface AppPresentationsStudioSlide {
  id: string;
  order: number;
  title: string;
  thumbnail?: string;
  isHidden?: boolean;
  scene: AppPresentationsStudioScene;
  isLocal?: boolean;
}

export type StudioPanelKey = "settings" | "source" | "history";

const POLL_INTERVAL_MS = 3000;

function buildEmptyScene(): AppPresentationsStudioScene {
  return {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: [],
    appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
    files: {},
  };
}

type AppPresentationsStudioContextProps = {
  title: string;
  createdAtLabel: string;
  createdBy: string;
  isFavorited: boolean;
  isLoading: boolean;
  isWaitingSlides: boolean;
  slides: AppPresentationsStudioSlide[];
  activeSlideId: string;
  activeSlide: AppPresentationsStudioSlide;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onReorderSlides: (activeId: string, overId: string) => void;
  onDuplicateSlide: (id: string) => void;
  onToggleHiddenSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  registerExcalidrawApi: (api: ExcalidrawImperativeAPI | null) => void;
  isSaving: boolean;
  onSave: () => void;
  activePanel: StudioPanelKey | null;
  onOpenPanel: (panel: StudioPanelKey) => void;
  onClosePanel: () => void;
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
  const { useList, useBulkUpdate } = useAppSlide();

  const [slides, setSlides] = useState<AppPresentationsStudioSlide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<StudioPanelKey | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const serializeRef = useRef<((skeletons: unknown[]) => AppPresentationsStudioScene) | null>(null);
  const [isSerializerReady, setIsSerializerReady] = useState(false);

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
    if (rawSlides.length === 0) return;

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
      }));

    setSlides(hydrated);
    setActiveSlideId(hydrated[0]?.id ?? "");
    setHasHydrated(true);
  }, [rawSlides, isSerializerReady, hasHydrated, presentation]);

  const captureActiveSlideElements = () => {
    const api = excalidrawApiRef.current;
    if (!api) return;

    const elements = [...api.getSceneElements()];
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === activeSlideId
          ? { ...slide, scene: { ...slide.scene, elements } }
          : slide,
      ),
    );
  };

  const onSelectSlide = (id: string) => {
    if (id === activeSlideId) return;
    captureActiveSlideElements();
    setActiveSlideId(id);
  };

  // Sem suporte no backend ainda pra inserir/remover/reordenar slide — fica só local
  // (mesmo tratamento combinado pro outline). Ver pm.md Backlog.
  const onAddSlide = () =>
    setSlides((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        order: prev.length,
        title: "Novo slide",
        scene: buildEmptyScene(),
        isLocal: true,
      },
    ]);

  const onDuplicateSlide = (id: string) =>
    setSlides((prev) => {
      const index = prev.findIndex((slide) => slide.id === id);
      if (index === -1) return prev;
      const duplicate = { ...prev[index], id: crypto.randomUUID(), isLocal: true };
      return [...prev.slice(0, index + 1), duplicate, ...prev.slice(index + 1)].map(
        (slide, i) => ({ ...slide, order: i }),
      );
    });

  const onReorderSlides = (activeId: string, overId: string) => {
    setSlides((prev) => {
      const oldIndex = prev.findIndex((slide) => slide.id === activeId);
      const newIndex = prev.findIndex((slide) => slide.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((slide, index) => ({
        ...slide,
        order: index,
      }));
    });
  };

  const onToggleHiddenSlide = (id: string) =>
    setSlides((prev) =>
      prev.map((slide) => (slide.id === id ? { ...slide, isHidden: !slide.isHidden } : slide)),
    );

  const onDeleteSlide = (id: string) => {
    if (slides.length <= 1) return;
    setSlides((prev) =>
      prev.filter((slide) => slide.id !== id).map((slide, i) => ({ ...slide, order: i })),
    );
    if (id === activeSlideId) {
      const fallback = slides.find((slide) => slide.id !== id);
      if (fallback) setActiveSlideId(fallback.id);
    }
  };

  const registerExcalidrawApi = (api: ExcalidrawImperativeAPI | null) => {
    excalidrawApiRef.current = api;
  };

  const onOpenPanel = (panel: StudioPanelKey) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  const onClosePanel = () => setActivePanel(null);

  const onSave = async () => {
    captureActiveSlideElements();
    setIsSaving(true);
    try {
      const api = excalidrawApiRef.current;
      const activeElements = api ? [...api.getSceneElements()] : undefined;

      await bulkUpdate.mutateAsync({
        slides: slides
          .filter((s) => !s.isLocal)
          .map((s) => ({
            id: s.id,
            elements: ((s.id === activeSlideId ? activeElements : undefined) ?? s.scene.elements) as unknown as Record<string, unknown>[],
            appState: s.scene.appState,
          })),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const activeSlide = slides.find((slide) => slide.id === activeSlideId) ?? slides[0] ?? {
    id: "",
    order: 0,
    title: "",
    scene: buildEmptyScene(),
  };

  const value: AppPresentationsStudioContextProps = {
    title: presentation?.title ?? "",
    createdAtLabel: presentation ? formatRelativeDate(presentation.createdAt, lang) : "",
    createdBy: "",
    isFavorited: false,
    isLoading: isLoadingPresentation || isLoadingSlides,
    isWaitingSlides: !hasHydrated,
    slides,
    activeSlideId,
    activeSlide,
    onSelectSlide,
    onAddSlide,
    onReorderSlides,
    onDuplicateSlide,
    onToggleHiddenSlide,
    onDeleteSlide,
    registerExcalidrawApi,
    isSaving,
    onSave,
    activePanel,
    onOpenPanel,
    onClosePanel,
  };

  return (
    <AppPresentationsStudioContext.Provider value={value}>
      {children}
    </AppPresentationsStudioContext.Provider>
  );
};

"use client";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { arrayMove } from "@dnd-kit/sortable";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

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
  /** Mock apenas — no schema real vem de `outline.title` via `outline_id` (relação 1:1 outline↔slide) */
  title: string;
  /** Mapeia `slide.thumbnail` — undefined até a geração automática existir (Ciclo 4) */
  thumbnail?: string;
  /** Mock local — reflete o futuro `slide.status = inactive` (persistência real na Fase 2b) */
  isHidden?: boolean;
  scene: AppPresentationsStudioScene;
}

export type StudioPanelKey = "settings" | "source" | "history";

const MOCK_TITLE = "Microsserviços na Nuvem";
const MOCK_CREATED_AT_LABEL = "há 2 dias";
const MOCK_CREATED_BY = "Alex C.";
const MOCK_IS_FAVORITED = false;

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

const MOCK_SLIDE_TITLES = [
  "Microsserviços na Nuvem",
  "O problema com monólitos",
  "Comunicação entre serviços",
  "Observabilidade e resiliência",
  "Próximos passos",
];

const MOCK_SLIDES: AppPresentationsStudioSlide[] = MOCK_SLIDE_TITLES.map((title, order) => ({
  id: `s${order + 1}`,
  order,
  title,
  scene: buildEmptyScene(),
}));

type AppPresentationsStudioContextProps = {
  title: string;
  createdAtLabel: string;
  createdBy: string;
  isFavorited: boolean;
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
  const [slides, setSlides] = useState<AppPresentationsStudioSlide[]>(MOCK_SLIDES);
  const [activeSlideId, setActiveSlideId] = useState(MOCK_SLIDES[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<StudioPanelKey | null>(null);
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    let isMounted = true;

    import("@/lib/excalidraw/serialize/skeleton-serializer").then(({ skeletonSerializer }) => {
      if (!isMounted) return;
      const { serialize } = skeletonSerializer();
      setSlides((prev) =>
        prev.map((slide) => ({
          ...slide,
          scene: serialize([
            { type: "text", x: 120, y: 140, text: slide.title, fontSize: 28 },
          ]) as AppPresentationsStudioScene,
        })),
      );
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const onAddSlide = () =>
    setSlides((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        order: prev.length,
        title: "Novo slide",
        scene: buildEmptyScene(),
      },
    ]);

  const onDuplicateSlide = (id: string) =>
    setSlides((prev) => {
      const index = prev.findIndex((slide) => slide.id === id);
      if (index === -1) return prev;
      const duplicate = { ...prev[index], id: crypto.randomUUID() };
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

  const onSave = () => {
    captureActiveSlideElements();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  const activeSlide = slides.find((slide) => slide.id === activeSlideId) ?? slides[0];

  const value: AppPresentationsStudioContextProps = {
    title: MOCK_TITLE,
    createdAtLabel: MOCK_CREATED_AT_LABEL,
    createdBy: MOCK_CREATED_BY,
    isFavorited: MOCK_IS_FAVORITED,
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

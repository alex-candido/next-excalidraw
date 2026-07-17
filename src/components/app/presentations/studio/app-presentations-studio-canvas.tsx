"use client";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { useEffect, useRef, useState } from "react";

import { ExcalidrawEditor } from "@/components/excalidraw/excalidraw-editor";
import { useStudioActions, useStudioActiveSlide } from "@/providers/app/app-presentations-studio-provider";

import { AppPresentationsStudioToolbar } from "@/components/app/presentations/studio/app-presentations-studio-toolbar";

const LIVE_PREVIEW_THROTTLE_MS = 200;

export function AppPresentationsStudioCanvas() {
  const activeSlide = useStudioActiveSlide();
  const { registerExcalidrawApi, setLiveActiveElements } = useStudioActions();
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!excalidrawApi) return;
    excalidrawApi.scrollToContent(excalidrawApi.getSceneElements(), { fitToViewport: true });
  }, [excalidrawApi, activeSlide.id]);

  // Excalidraw chama onChange várias vezes por segundo durante uma interação
  // (arrastar, redimensionar) — throttle evita recalcular a prévia SVG da
  // sidebar nessa frequência toda; "tempo real" aqui não precisa ser por-frame.
  const handleChange = (elements: readonly ExcalidrawElement[]) => {
    if (throttleRef.current) return;
    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
    }, LIVE_PREVIEW_THROTTLE_MS);
    setLiveActiveElements(elements);
  };

  return (
    <div className="app-presentations-studio-canvas flex min-h-0 flex-col overflow-hidden rounded-xl border bg-background md:h-[calc(100vh-5.5rem)]! md:min-w-0 md:flex-1">
      <AppPresentationsStudioToolbar />
      <div className="min-h-0 flex-1">
        <ExcalidrawEditor
          key={activeSlide.id}
          initialData={{ elements: activeSlide.scene.elements, appState: activeSlide.scene.appState }}
          onChange={handleChange}
          excalidrawAPI={(api) => {
            setExcalidrawApi(api);
            registerExcalidrawApi(api);
          }}
        />
      </div>
    </div>
  );
}

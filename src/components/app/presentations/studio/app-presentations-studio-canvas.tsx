"use client";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useEffect, useState } from "react";

import { ExcalidrawEditor } from "@/components/excalidraw/excalidraw-editor";
import { useAppPresentationsStudio } from "@/providers/app/app-presentations-studio-provider";

export function AppPresentationsStudioCanvas() {
  const { activeSlide, registerExcalidrawApi } = useAppPresentationsStudio();
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (!excalidrawApi) return;
    excalidrawApi.scrollToContent(excalidrawApi.getSceneElements(), { fitToViewport: true });
  }, [excalidrawApi, activeSlide.id]);

  return (
    <div className="app-presentations-studio-canvas h-[calc(100vh-5.5rem)]! min-w-0 flex-1 overflow-hidden rounded-xl border bg-background">
      <ExcalidrawEditor
        key={activeSlide.id}
        initialData={{ elements: activeSlide.scene.elements, appState: activeSlide.scene.appState }}
        excalidrawAPI={(api) => {
          setExcalidrawApi(api);
          registerExcalidrawApi(api);
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { ExcalidrawEditor } from "@/components/excalidraw/excalidraw-editor";
import { useAppPresentationsPresent } from "@/providers/app/app-presentations-present-provider";
import { useStudioActiveSlide } from "@/providers/app/app-presentations-studio-provider";

export function AppPresentationsPresentCanvas() {
  const t = useTranslations("app.present.nav");
  const activeSlide = useStudioActiveSlide();
  const { hasPrevious, hasNext, onPrevious, onNext } = useAppPresentationsPresent();

  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div
      className="app-presentations-present-canvas relative shrink-0"
      style={dimensions ? { width: dimensions.width, height: dimensions.height } : undefined}
    >
      {dimensions ? (
        <ExcalidrawEditor
          key={activeSlide.id}
          viewModeEnabled
          zenModeEnabled
          initialData={{ elements: activeSlide.scene.elements, appState: activeSlide.scene.appState }}
        />
      ) : null}
      {/* Bloqueia pan/zoom do Excalidraw durante a apresentação e reserva metade esquerda/direita para navegação por clique (ref: excalidraw-slides) */}
      <div className="app-presentations-present-canvas-overlay absolute inset-0 z-10 flex">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={onPrevious}
          aria-label={t("previous")}
          className="app-presentations-present-canvas-overlay-previous h-full flex-1 cursor-w-resize disabled:cursor-default"
        />
        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          aria-label={t("next")}
          className="app-presentations-present-canvas-overlay-next h-full flex-1 cursor-e-resize disabled:cursor-default"
        />
      </div>
    </div>
  );
}

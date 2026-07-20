"use client";

import type { CaptureUpdateActionType } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useEffect, useRef, useState } from "react";

import { ExcalidrawEditor } from "@/components/excalidraw/excalidraw-editor";
import { useStudioActions, useStudioActiveSlide } from "@/providers/app/app-presentations-studio-provider";

import { AppPresentationsStudioPanel } from "@/components/app/presentations/studio/panel/app-presentations-studio-panel";

export function AppPresentationsStudioCanvas() {
  const activeSlide = useStudioActiveSlide();
  const { registerExcalidrawApi } = useStudioActions();
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  // CaptureUpdateAction toca `window` na avaliação do módulo (mesmo motivo do
  // resto de lib/excalidraw) — carregado 1x aqui, valor guardado num ref.
  const captureUpdateNever = useRef<CaptureUpdateActionType | null>(null);
  // Slide que já está carregado na instância viva do Excalidraw — nunca mais
  // remonta o componente a cada troca (era isso que causava a lentidão ao
  // navegar entre slides); troca de cena via updateScene em vez disso.
  // Confirmado (teste com o usuário) que isso NÃO era a causa do
  // deslocamento de texto/seta reportado — a causa real era
  // convertToExcalidrawElements rodando 2x (ver skeleton-serializer.ts,
  // ADR-023); updateScene sempre trabalhou com ExcalidrawElement[] real,
  // nunca com skeleton, então nunca teve esse problema.
  const loadedSlideId = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    import("@excalidraw/excalidraw").then(({ CaptureUpdateAction }) => {
      if (isMounted) captureUpdateNever.current = CaptureUpdateAction.NEVER;
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!excalidrawApi) return;
    // Store perde a referência em resetForPresentation() (troca de
    // presentation sem reload de página, ver providers/app/index.tsx) — como
    // o canvas não remonta mais, precisa re-registrar aqui, não só na
    // montagem inicial via excalidrawAPI abaixo.
    registerExcalidrawApi(excalidrawApi);

    // Primeira vez que a API fica pronta: o slide certo já está na tela via
    // `initialData` (prop só lida na montagem) — só marca como carregado,
    // sem chamar updateScene de novo em cima do que já está certo.
    if (loadedSlideId.current === null) {
      loadedSlideId.current = activeSlide.id;
      excalidrawApi.scrollToContent(excalidrawApi.getSceneElements(), { fitToViewport: true });
      return;
    }

    if (loadedSlideId.current === activeSlide.id) return;
    loadedSlideId.current = activeSlide.id;

    excalidrawApi.updateScene({
      elements: [...activeSlide.scene.elements],
      appState: activeSlide.scene.appState,
      // NEVER pq é troca de slide, não edição local — não deve virar undo.
      ...(captureUpdateNever.current !== null ? { captureUpdate: captureUpdateNever.current } : {}),
    });
    excalidrawApi.history.clear();
    excalidrawApi.scrollToContent(activeSlide.scene.elements, { fitToViewport: true });
  }, [excalidrawApi, activeSlide.id, activeSlide.scene, registerExcalidrawApi]);

  return (
    <div className="app-presentations-studio-canvas relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-background md:h-[calc(100vh-5.5rem)]! md:min-w-0 md:flex-1">
      <div className="min-h-0 flex-1">
        <ExcalidrawEditor
          initialData={{ elements: activeSlide.scene.elements, appState: activeSlide.scene.appState }}
          excalidrawAPI={(api) => {
            setExcalidrawApi(api);
            registerExcalidrawApi(api);
          }}
        />
      </div>
      <AppPresentationsStudioPanel />
    </div>
  );
}

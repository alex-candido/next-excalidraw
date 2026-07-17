"use client";

import { useEffect, useRef } from "react";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { cn } from "@/lib/utils";

interface AppPresentationsStudioSlidePreviewProps {
  elements: readonly ExcalidrawElement[];
  className?: string;
}

// Prévia ao vivo via SVG (não imagem gerada/salva) — renderiza os elements
// reais do slide direto num <svg>, sem upload nem servidor envolvido. Só faz
// sentido aqui dentro (sidebar do Studio, sessão já aberta com os elements na
// memória); a capa persistida no R2 (ver use-app-studio-save.ts) é o que
// aparece no card fora do Studio, onde não faz sentido carregar o Excalidraw
// só pra desenhar uma prévia. Ver docs/sdd/1-product/pm/decisions.md.
export function AppPresentationsStudioSlidePreview({ elements, className }: AppPresentationsStudioSlidePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!containerRef.current || elements.length === 0) return;

      // exportToSvg toca `window` na avaliação do módulo — import adiado, mesmo
      // motivo do skeleton-serializer/exportToBlob (ver hooks/app/use-app-studio-*.ts).
      const { exportToSvg } = await import("@excalidraw/excalidraw");
      const svg = await exportToSvg({
        elements: elements as ExcalidrawElement[],
        appState: { viewBackgroundColor: "#ffffff", exportWithDarkMode: false },
        files: null,
      });

      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.display = "block";
      containerRef.current.appendChild(svg);
    }

    render().catch((err) => console.warn("Falha ao gerar prévia do slide:", err));

    return () => {
      cancelled = true;
    };
  }, [elements]);

  return <div ref={containerRef} className={cn("app-presentations-studio-slide-preview size-full", className)} />;
}

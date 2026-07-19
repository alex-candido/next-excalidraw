"use client";

import { useEffect, useState } from "react";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { cn, resolveThumbnailSrc } from "@/lib/utils";

interface AppPresentationsStudioSlidePreviewProps {
  elements: readonly ExcalidrawElement[];
  className?: string;
}

// Prévia ao vivo (não imagem persistida/salva) — recalcula a cada edição do
// slide ativo, igual antes. A diferença: o resultado do exportToSvg é
// serializado e vira o `src` de uma única <img> (mesmo encoding da capa
// persistida, ver lib/utils/thumbnail.ts), em vez de uma árvore inteira de
// nós <svg> sendo desmontada/remontada no DOM a cada tick — mais barato pro
// DOM/reflow com a mesma frequência de atualização. Ver docs/sdd/1-product/pm/decisions.md.
export function AppPresentationsStudioSlidePreview({ elements, className }: AppPresentationsStudioSlidePreviewProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (elements.length === 0) return;

      // exportToSvg toca `window` na avaliação do módulo — import adiado, mesmo
      // motivo do skeleton-serializer/exportToBlob (ver hooks/app/use-app-studio-*.ts).
      const { exportToSvg } = await import("@excalidraw/excalidraw");
      const svg = await exportToSvg({
        elements: elements as ExcalidrawElement[],
        appState: { viewBackgroundColor: "#ffffff", exportWithDarkMode: false },
        files: null,
      });

      if (cancelled) return;
      const serialized = new XMLSerializer().serializeToString(svg);
      setSrc(resolveThumbnailSrc(serialized));
    }

    render().catch((err) => console.warn("Falha ao gerar prévia do slide:", err));

    return () => {
      cancelled = true;
    };
  }, [elements]);

  if (!src) return <div className={cn("app-presentations-studio-slide-preview size-full", className)} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn("app-presentations-studio-slide-preview size-full", className)}
    />
  );
}

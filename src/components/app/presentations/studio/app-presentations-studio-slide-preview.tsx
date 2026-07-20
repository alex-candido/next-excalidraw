"use client";

import { useEffect, useState } from "react";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import { cn, resolveThumbnailSrc } from "@/lib/utils";

interface AppPresentationsStudioSlidePreviewProps {
  elements: readonly ExcalidrawElement[];
  className?: string;
}

// Fallback ao vivo (não imagem persistida) — só é montado enquanto o slide
// ainda não tem `thumbnail` calculada (ver app-presentations-studio-slide-
// list-item.tsx), nunca durante edição normal: recalcular a cada onChange era
// o que causava lentidão na página, então a sidebar hoje prioriza a
// thumbnail armazenada (refreshSlideThumbnail em app-studio-store.ts). O
// resultado do exportToSvg é serializado e vira o `src` de uma única <img>
// (mesmo encoding da thumbnail persistida, ver lib/utils/thumbnail.ts).
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

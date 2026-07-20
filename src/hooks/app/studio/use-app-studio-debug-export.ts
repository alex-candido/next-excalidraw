"use client";

import { useState } from "react";
import { useStudioStore } from "@/store/app-studio-store";

// Só em dev — exporta cada slide da presentation como um PNG separado (render
// real via exportToCanvas, mesmo pipeline visual que o usuário vê) e salva
// local no projeto via /api/v1/debug/export-slides, pra inspeção direta de
// bug visual sem depender de screenshot manual. PNG por slide (não mais 1 PDF
// único) — mais direto de abrir/comparar 1 a 1 com o que está no banco.
// Nunca chamado em produção (ver a própria rota, que recusa fora de
// NODE_ENV=development).
export function useAppStudioDebugExport(presentationId: string) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAll = async () => {
    setIsExporting(true);
    try {
      useStudioStore.getState().captureActiveSlideElements();
      const { slides } = useStudioStore.getState();
      const { exportToCanvas } = await import("@excalidraw/excalidraw");

      const nonEmptySlides = slides.filter((slide) => slide.scene.elements.length > 0);
      if (nonEmptySlides.length === 0) return;

      const formData = new FormData();
      formData.append("presentationId", presentationId);

      for (const slide of nonEmptySlides) {
        const canvas = await exportToCanvas({
          elements: slide.scene.elements,
          appState: { ...slide.scene.appState, exportBackground: true },
          files: {},
        });
        const blob: Blob = await new Promise((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob falhou"))), "image/png"),
        );
        formData.append("files", blob, `${String(slide.order).padStart(2, "0")}-${slide.id}.png`);
      }

      await fetch("/api/v1/debug/export-slides", { method: "POST", body: formData });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportAll, isExporting };
}

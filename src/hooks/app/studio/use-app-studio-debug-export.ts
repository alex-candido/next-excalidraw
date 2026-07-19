"use client";

import { useState } from "react";
import { useStudioStore } from "@/store/app-studio-store";

// Só em dev — exporta a presentation inteira como UM PDF (uma página por
// slide, render real via exportToCanvas, mesmo pipeline visual que o
// usuário vê) e salva local no projeto via /api/v1/debug/export-slides, pra
// inspeção direta de bug visual sem depender de screenshot manual. PDF (não
// N PNGs separados) porque o Read tool lê várias páginas de PDF numa chamada
// só — mais barato de inspecionar do que abrir arquivo por arquivo. Nunca
// chamado em produção (ver a própria rota, que recusa fora de
// NODE_ENV=development). Ver docs/adr.md.
export function useAppStudioDebugExport(presentationId: string) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAll = async () => {
    setIsExporting(true);
    try {
      useStudioStore.getState().captureActiveSlideElements();
      const { slides } = useStudioStore.getState();
      const { exportToCanvas } = await import("@excalidraw/excalidraw");
      const { jsPDF } = await import("jspdf");

      const nonEmptySlides = slides.filter((slide) => slide.scene.elements.length > 0);
      if (nonEmptySlides.length === 0) return;

      let doc: InstanceType<typeof jsPDF> | null = null;

      for (const slide of nonEmptySlides) {
        const canvas = await exportToCanvas({
          elements: slide.scene.elements,
          appState: { ...slide.scene.appState, exportBackground: true },
          files: {},
        });
        const dataUrl = canvas.toDataURL("image/png");
        const format: [number, number] = [canvas.width, canvas.height];
        // Slide 16:9 é sempre mais largo que alto — sem `orientation`
        // explícita o jsPDF assume portrait por padrão e não infere pelo
        // formato customizado, o que rotacionava/cortava a página errado.
        const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";

        if (!doc) {
          doc = new jsPDF({ unit: "px", format, orientation });
        } else {
          doc.addPage(format, orientation);
        }
        doc.addImage(dataUrl, "PNG", 0, 0, canvas.width, canvas.height);
      }

      if (!doc) return;

      const blob = doc.output("blob");
      const formData = new FormData();
      formData.append("file", blob, "presentation.pdf");
      formData.append("presentationId", presentationId);

      await fetch("/api/v1/debug/export-slides", { method: "POST", body: formData });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportAll, isExporting };
}

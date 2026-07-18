import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"

// Client-only — exportToSvg toca `window` na avaliação do módulo do
// @excalidraw/excalidraw, mesmo motivo do skeleton-serializer (import adiado
// aqui dentro, nunca no topo do arquivo, pra este arquivo continuar seguro
// de importar estaticamente em qualquer lugar).
//
// Usado pra persistir a capa da presentation como texto (slide.thumbnail),
// não como arquivo — ver docs/adr.md. Diferente da prévia da sidebar do
// Studio (app-presentations-studio-slide-preview.tsx), que hardcoda fundo
// branco por ser só uma prévia rápida, aqui usamos o `appState` real do
// slide (cor de fundo do tema etc.) — este é o resultado que persiste.
export async function renderSvgThumbnail(
  elements: readonly ExcalidrawElement[],
  appState: Record<string, unknown>,
): Promise<string> {
  const { exportToSvg } = await import("@excalidraw/excalidraw")
  const svg = await exportToSvg({
    elements: elements as ExcalidrawElement[],
    appState: appState as never,
    files: null,
  })
  return new XMLSerializer().serializeToString(svg)
}

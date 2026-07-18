// slide.thumbnail guarda texto SVG (exportToSvg serializado) desde o
// ADR de troca do storage/R2 por campo inline — mas presentations antigas
// podem ainda ter uma URL do R2 salva de antes da mudança. Detecta pelo
// conteúdo em vez de assumir um formato só, pra não quebrar o que já existe.
export function resolveThumbnailSrc(thumbnail: string): string {
  const trimmed = thumbnail.trimStart()
  if (trimmed.startsWith("<svg")) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`
  }
  return thumbnail
}

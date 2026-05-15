import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

type Edge = "left" | "right" | "top" | "bottom"
type Rect = { x: number; y: number; width: number; height: number }

function getRect(el: ExcalidrawElementSkeleton): Rect {
  return {
    x: (el as Record<string, unknown>).x as number ?? 0,
    y: (el as Record<string, unknown>).y as number ?? 0,
    width: (el as Record<string, unknown>).width as number ?? 100,
    height: (el as Record<string, unknown>).height as number ?? 100,
  }
}

function determineEdges(start: Rect, end: Rect): { startEdge: Edge; endEdge: Edge } {
  const dx = (start.x + start.width / 2) - (end.x + end.width / 2)
  const dy = (start.y + start.height / 2) - (end.y + end.height / 2)

  const L2R = start.x - (end.x + end.width)
  const R2L = -((start.x + start.width) - end.x)
  const T2B = start.y - (end.y + end.height)
  const B2T = -((start.y + start.height) - end.y)

  if (dx > 0 && dy > 0) return L2R > T2B ? { startEdge: "left", endEdge: "right" } : { startEdge: "top", endEdge: "bottom" }
  if (dx < 0 && dy > 0) return R2L > T2B ? { startEdge: "right", endEdge: "left" } : { startEdge: "top", endEdge: "bottom" }
  if (dx > 0 && dy < 0) return L2R > B2T ? { startEdge: "left", endEdge: "right" } : { startEdge: "bottom", endEdge: "top" }
  if (dx < 0 && dy < 0) return R2L > B2T ? { startEdge: "right", endEdge: "left" } : { startEdge: "bottom", endEdge: "top" }
  if (dx === 0 && dy > 0) return { startEdge: "top", endEdge: "bottom" }
  if (dx === 0 && dy < 0) return { startEdge: "bottom", endEdge: "top" }
  if (dx > 0) return { startEdge: "left", endEdge: "right" }
  if (dx < 0) return { startEdge: "right", endEdge: "left" }
  return { startEdge: "right", endEdge: "left" }
}

function getEdgeCenter(rect: Rect, edge: Edge): { x: number; y: number } {
  switch (edge) {
    case "left":   return { x: rect.x,               y: rect.y + rect.height / 2 }
    case "right":  return { x: rect.x + rect.width,  y: rect.y + rect.height / 2 }
    case "top":    return { x: rect.x + rect.width / 2, y: rect.y }
    case "bottom": return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
  }
}

export function normalizeArrows(skeletons: ExcalidrawElementSkeleton[]): ExcalidrawElementSkeleton[] {
  const elementMap = new Map<string, ExcalidrawElementSkeleton>()
  for (const el of skeletons) {
    const id = (el as Record<string, unknown>).id as string | undefined
    if (id) elementMap.set(id, el)
  }

  return skeletons.map((el) => {
    const raw = el as Record<string, unknown>
    if (raw.type !== "arrow" && raw.type !== "line") return el

    const startId = (raw.start as Record<string, unknown> | undefined)?.id as string | undefined
    const endId   = (raw.end   as Record<string, unknown> | undefined)?.id as string | undefined
    if (!startId || !endId) return el

    const startEl = elementMap.get(startId)
    const endEl   = elementMap.get(endId)
    if (!startEl || !endEl) return el

    const startRect = getRect(startEl)
    const endRect   = getRect(endEl)

    const { startEdge, endEdge } = determineEdges(startRect, endRect)
    const startPt = getEdgeCenter(startRect, startEdge)
    const endPt   = getEdgeCenter(endRect, endEdge)

    const width = endPt.x - startPt.x
    const height = endPt.y - startPt.y

    return {
      ...el,
      x: startPt.x,
      y: startPt.y,
      width: width === 0 ? 1 : width,
      height,
    }
  })
}

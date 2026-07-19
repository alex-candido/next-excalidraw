import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

type Rect = { x: number; y: number; width: number; height: number }
type Raw = Record<string, unknown>

// O prompt promete "Coordenadas calculadas pelos children com margem de
// 10px" (ver ELEM_FRAME), mas nada no código fazia esse cálculo —
// convertToExcalidrawElements não tem NENHUM fallback pra x/y/width/height
// de frame (nem o `||` que arrow/shape têm), então um frame sem esses campos
// vira NaN puro no editor. Sempre recalcula a partir dos children já
// resolvidos (nunca confia no valor que a IA mandou, mesma lógica do
// `points` em arrows-normalizer.ts) — roda depois do binding-repairer, que já
// garantiu frame.children só com ids reais do slide.
const FRAME_MARGIN = 10
const FALLBACK_RECT: Rect = { x: 0, y: 0, width: 100, height: 100 }

function getRect(raw: Raw): Rect {
  return {
    x: Number.isFinite(raw.x) ? (raw.x as number) : 0,
    y: Number.isFinite(raw.y) ? (raw.y as number) : 0,
    width: Number.isFinite(raw.width) ? (raw.width as number) : 100,
    height: Number.isFinite(raw.height) ? (raw.height as number) : 100,
  }
}

function unionRect(rects: Rect[]): Rect {
  const minX = Math.min(...rects.map((r) => r.x))
  const minY = Math.min(...rects.map((r) => r.y))
  const maxX = Math.max(...rects.map((r) => r.x + r.width))
  const maxY = Math.max(...rects.map((r) => r.y + r.height))
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function hasFiniteGeometry(raw: Raw): boolean {
  return Number.isFinite(raw.x) && Number.isFinite(raw.y) && Number.isFinite(raw.width) && Number.isFinite(raw.height)
}

export function frameBoundsResolver() {
  function resolve(skeletons: ExcalidrawElementSkeleton[]): ExcalidrawElementSkeleton[] {
    const byId = new Map<string, Raw>()
    for (const el of skeletons) {
      const raw = el as Raw
      if (raw.id) byId.set(raw.id as string, raw)
    }

    return skeletons.map((el) => {
      const raw = el as Raw
      if (raw.type !== "frame") return el

      const children = (raw.children as string[] | undefined) ?? []
      const childRects = children
        .map((id) => byId.get(id))
        .filter((child): child is Raw => !!child)
        .map(getRect)

      if (childRects.length === 0) {
        return hasFiniteGeometry(raw) ? el : { ...el, ...FALLBACK_RECT }
      }

      const bounds = unionRect(childRects)
      return {
        ...el,
        x: bounds.x - FRAME_MARGIN,
        y: bounds.y - FRAME_MARGIN,
        width: bounds.width + FRAME_MARGIN * 2,
        height: bounds.height + FRAME_MARGIN * 2,
      }
    })
  }

  return { resolve }
}

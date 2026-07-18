import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import { elementSizing } from "@/lib/excalidraw/math/element-sizing"

type Raw = Record<string, unknown>

const { snapToGrid } = elementSizing()

// Arrow/line ficam de fora do snap de width/height: arrows-normalizer já
// força width:0 -> 1 (bug de render do Excalidraw com seta de largura
// zero), e 1 sempre viraria 0 de novo num grid de 20px
// (Math.round(1/20)*20 === 0) — desfaria esse fix.
const SKIP_SIZE_TYPES = new Set(["arrow", "line"])

export function gridSnapper() {
  function snap(skeletons: ExcalidrawElementSkeleton[], gridSize = 20): ExcalidrawElementSkeleton[] {
    return skeletons.map((el) => {
      const raw = el as Raw
      const patches: Partial<Raw> = {}

      const fields: Array<"x" | "y" | "width" | "height"> = ["x", "y"]
      if (!SKIP_SIZE_TYPES.has(raw.type as string)) fields.push("width", "height")

      for (const field of fields) {
        if (!Number.isFinite(raw[field])) continue
        const snapped = snapToGrid(raw[field] as number, gridSize)
        if (snapped !== raw[field]) patches[field] = snapped
      }

      return Object.keys(patches).length ? { ...el, ...patches } : el
    })
  }

  return { snap }
}

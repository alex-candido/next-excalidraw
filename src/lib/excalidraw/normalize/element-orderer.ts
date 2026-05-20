import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

type Raw = Record<string, unknown>

// Layer priority (lower = rendered first / further back)
const LAYER: Record<string, number> = {
  frame:     0,
  line:      1,
  rectangle: 2,
  ellipse:   2,
  diamond:   2,
  image:     2,
  text:      3, // standalone text; bound text handled separately
  arrow:     4,
}

function layerOf(raw: Raw): number {
  const type = raw.type as string
  return LAYER[type] ?? 2
}

export function elementOrderer() {
  function order(skeletons: ExcalidrawElementSkeleton[]): ExcalidrawElementSkeleton[] {
    const raws = skeletons.map(el => el as Raw)

    // Separate bound texts from everything else (they must follow their container)
    const boundTexts  = new Map<string, Raw[]>()  // containerId → text elements
    const nonBound: Raw[] = []

    for (const raw of raws) {
      const containerId = raw.type === "text"
        ? (raw.containerId as string | undefined)
        : undefined

      if (containerId) {
        if (!boundTexts.has(containerId)) boundTexts.set(containerId, [])
        boundTexts.get(containerId)!.push(raw)
      } else {
        nonBound.push(raw)
      }
    }

    // Sort non-bound elements by layer, preserving relative order within each layer
    nonBound.sort((a, b) => layerOf(a) - layerOf(b))

    // Rebuild: for each non-bound element, append its bound texts immediately after
    const result: Raw[] = []
    for (const raw of nonBound) {
      result.push(raw)
      const id      = raw.id as string | undefined
      const children = id ? boundTexts.get(id) : undefined
      if (children) result.push(...children)
    }

    // Orphaned bound texts (container not found) go before arrows
    for (const [containerId, texts] of boundTexts) {
      if (!result.some(r => r.id === containerId)) {
        result.push(...texts)
      }
    }

    return result as ExcalidrawElementSkeleton[]
  }

  return { order }
}

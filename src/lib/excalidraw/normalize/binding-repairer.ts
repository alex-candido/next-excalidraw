import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

type Raw = Record<string, unknown>
type BoundEntry = { type: string; id: string }

export function bindingRepairer() {
  function repair(skeletons: ExcalidrawElementSkeleton[]): ExcalidrawElementSkeleton[] {
    const byId = new Map<string, Raw>()
    for (const el of skeletons) {
      const raw = el as Raw
      if (raw.id) byId.set(raw.id as string, raw)
    }

    const patches = new Map<string, Partial<Raw>>()

    function getPatch(id: string): Partial<Raw> {
      if (!patches.has(id)) patches.set(id, {})
      return patches.get(id)!
    }

    function boundElementsOf(raw: Raw): BoundEntry[] {
      const patch = patches.get(raw.id as string)
      const source = (patch?.boundElements ?? raw.boundElements) as BoundEntry[] | undefined
      return source ?? []
    }

    // Pass 1: text with containerId → ensure container has the boundElements entry
    for (const el of skeletons) {
      const raw = el as Raw
      if (raw.type !== "text") continue
      const textId     = raw.id as string | undefined
      const containerId = raw.containerId as string | undefined
      if (!textId || !containerId) continue

      const container = byId.get(containerId)
      if (!container) continue

      const bound = boundElementsOf(container)
      if (!bound.some(be => be.id === textId && be.type === "text")) {
        getPatch(containerId).boundElements = [...bound, { type: "text", id: textId }]
      }
    }

    // Pass 2: container with boundElements → ensure each text has containerId
    for (const el of skeletons) {
      const raw        = el as Raw
      const containerId = raw.id as string | undefined
      if (!containerId) continue

      const bound = boundElementsOf(raw)
      for (const be of bound) {
        if (be.type !== "text") continue
        const textEl = byId.get(be.id)
        if (!textEl) continue

        const effectiveContainerId =
          (patches.get(be.id)?.containerId ?? textEl.containerId) as string | undefined

        if (effectiveContainerId !== containerId) {
          getPatch(be.id).containerId = containerId
        }
      }
    }

    if (patches.size === 0) return skeletons

    return skeletons.map(el => {
      const raw = el as Raw
      const id  = raw.id as string | undefined
      if (!id) return el
      const patch = patches.get(id)
      return patch ? { ...el, ...patch } : el
    })
  }

  return { repair }
}

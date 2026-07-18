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

    function childrenOf(raw: Raw): string[] {
      const patch = patches.get(raw.id as string)
      const source = (patch?.children ?? raw.children) as string[] | undefined
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

    // Pass 3: elemento com frameId → garante que o frame tem esse id em children.
    // Mesmo problema do Pass 1, outro par de campos: a IA às vezes seta
    // frameId no filho mas esquece de listar o id de volta em frame.children
    // — sem isso, convertToExcalidrawElements quebra ao processar o frame
    // (esperava children como array, veio undefined).
    for (const el of skeletons) {
      const raw     = el as Raw
      const childId = raw.id as string | undefined
      const frameId = raw.frameId as string | undefined
      if (!childId || !frameId) continue

      const frame = byId.get(frameId)
      if (!frame || frame.type !== "frame") continue

      const children = childrenOf(frame)
      if (!children.includes(childId)) {
        getPatch(frameId).children = [...children, childId]
      }
    }

    // Pass 4: frame com children → garante que cada filho referenciado tem frameId de volta.
    for (const el of skeletons) {
      const raw     = el as Raw
      const frameId = raw.id as string | undefined
      if (!frameId || raw.type !== "frame") continue

      const children = childrenOf(raw)
      for (const childId of children) {
        const childEl = byId.get(childId)
        if (!childEl) continue

        const effectiveFrameId = (patches.get(childId)?.frameId ?? childEl.frameId) as string | undefined
        if (effectiveFrameId !== frameId) {
          getPatch(childId).frameId = frameId
        }
      }
    }

    // Pass 5: frame sem nenhum filho referenciando de volta (nem via frameId,
    // nem já com children preenchido) fica sem children até aqui —
    // convertToExcalidrawElements espera um array, nunca undefined. Fallback:
    // frame decorativo vazio é válido, [] é seguro (nunca perde conteúdo
    // real, só cobre o caso de não haver nenhum filho pra descobrir).
    for (const el of skeletons) {
      const raw = el as Raw
      if (raw.type !== "frame") continue
      const patch = patches.get(raw.id as string)
      const effectiveChildren = (patch?.children ?? raw.children) as string[] | undefined
      if (!Array.isArray(effectiveChildren)) {
        getPatch(raw.id as string).children = []
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

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

type Raw = Record<string, unknown>

// Roda antes de qualquer outro normalizer — binding-repairer, element-orderer
// etc. montam um Map por id logo de cara, e um elemento sem id vira
// `id: undefined` no convertToExcalidrawElements final (regenerateIds: false
// no skeleton-serializer), o que faz múltiplos elementos sem id colidirem no
// mesmo id "undefined".
export function idGenerator() {
  function generate(skeletons: ExcalidrawElementSkeleton[]): ExcalidrawElementSkeleton[] {
    return skeletons.map((el) => {
      const raw = el as Raw
      if (typeof raw.id === "string" && raw.id.length > 0) return el
      return { ...el, id: crypto.randomUUID() }
    })
  }

  return { generate }
}

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import { jsonRepairer } from "@/lib/excalidraw/parse/json-repairer"

const { stripCodeFences, repairAndParseArray, extractObjects } = jsonRepairer()

const VALID_TYPES          = new Set(["rectangle", "ellipse", "diamond", "text", "arrow", "line", "frame"])
const TEXT_STROKE_FALLBACK = "#1e1e1e"

function isValidSkeleton(obj: unknown): obj is ExcalidrawElementSkeleton {
  if (!obj || typeof obj !== "object") return false
  const el = obj as Record<string, unknown>
  return typeof el.type === "string" && VALID_TYPES.has(el.type)
}

function normalizeTextContent(value: unknown): unknown {
  if (typeof value !== "string") return value
  return value.replace(/\\n/g, "\n")
}

// convertToExcalidrawElements calcula width/height de texto livre a partir da
// métrica da fonte e depois faz `{ width: metrics.width, ...element }` — o
// spread do skeleton por cima do valor calculado sobrescreve silenciosamente
// se a IA fornecer o campo (mesmo padrão do `points` em arrows-normalizer.ts).
// O prompt já proíbe ("não forneça"), isso só garante em código.
function stripTextDimensions(skeleton: ExcalidrawElementSkeleton): ExcalidrawElementSkeleton {
  const el = skeleton as Record<string, unknown>
  if (el.type !== "text") return skeleton
  if (!("width" in el) && !("height" in el)) return skeleton
  const { width: _width, height: _height, ...rest } = el
  return rest as ExcalidrawElementSkeleton
}

function applyFallbacks(skeleton: ExcalidrawElementSkeleton): ExcalidrawElementSkeleton {
  const stripped = stripTextDimensions(skeleton)
  const el      = stripped as Record<string, unknown>
  const patches: Record<string, unknown> = {}

  if (typeof el.text === "string") patches.text = normalizeTextContent(el.text)
  if (el.label && typeof el.label === "object") {
    const label = el.label as Record<string, unknown>
    if (typeof label.text === "string") {
      patches.label = { ...label, text: normalizeTextContent(label.text) }
    }
  }

  if (typeof el.strokeColor !== "string" || !el.strokeColor) {
    patches.strokeColor = TEXT_STROKE_FALLBACK
  }

  if (el.backgroundColor == null || el.backgroundColor === "") {
    patches.backgroundColor = "transparent"
  }

  return Object.keys(patches).length ? { ...stripped, ...patches } : stripped
}

export function elementParser() {
  function parse(text: string): ExcalidrawElementSkeleton[] {
    const cleaned = stripCodeFences(text)

    const arr = repairAndParseArray(cleaned)
    if (arr) {
      const valid = arr.filter(isValidSkeleton).map(applyFallbacks)
      if (valid.length > 0) return valid
    }

    return extractObjects(cleaned).filter(isValidSkeleton).map(applyFallbacks)
  }

  function validate(raw: unknown[]): ExcalidrawElementSkeleton[] {
    return raw.filter(isValidSkeleton).map(applyFallbacks)
  }

  return { parse, validate }
}

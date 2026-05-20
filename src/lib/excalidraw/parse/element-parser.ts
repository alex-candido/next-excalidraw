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

function applyFallbacks(skeleton: ExcalidrawElementSkeleton): ExcalidrawElementSkeleton {
  const el      = skeleton as Record<string, unknown>
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

  return Object.keys(patches).length ? { ...skeleton, ...patches } : skeleton
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

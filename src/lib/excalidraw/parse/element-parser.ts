import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

const VALID_TYPES = new Set(["rectangle", "ellipse", "diamond", "text", "arrow", "line", "frame"])

function stripCodeFences(text: string): string {
  return text.replace(/```(?:json|js|javascript)?\n?([\s\S]*?)```/g, "$1").trim()
}

function repairAndParseArray(text: string): unknown[] | null {
  const start = text.indexOf("[")
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escape = false
  let end = -1

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === "\\" && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === "[" || ch === "{") depth++
    else if (ch === "]" || ch === "}") {
      depth--
      if (depth === 0) { end = i + 1; break }
    }
  }

  const slice = end > start
    ? text.slice(start, end)
    : text.slice(start) + "]"

  try {
    return JSON.parse(slice.replace(/,\s*([}\]])/g, "$1")) as unknown[]
  } catch {
    return null
  }
}

function extractObjects(text: string): unknown[] {
  const results: unknown[] = []
  let i = 0

  while (i < text.length) {
    const start = text.indexOf("{", i)
    if (start === -1) break

    let depth = 0
    let inString = false
    let escape = false
    let end = -1

    for (let j = start; j < text.length; j++) {
      const ch = text[j]
      if (escape) { escape = false; continue }
      if (ch === "\\" && inString) { escape = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (inString) continue
      if (ch === "{") depth++
      else if (ch === "}") {
        depth--
        if (depth === 0) { end = j + 1; break }
      }
    }

    if (end > start) {
      try {
        results.push(JSON.parse(text.slice(start, end).replace(/,\s*([}\]])/g, "$1")))
      } catch { /* skip malformed object */ }
      i = end
    } else {
      break
    }
  }

  return results
}

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
  const el = skeleton as Record<string, unknown>
  const patches: Record<string, unknown> = {}

  // fix literal \n in text content
  if (typeof el.text === "string") patches.text = normalizeTextContent(el.text)
  if (el.label && typeof el.label === "object") {
    const label = el.label as Record<string, unknown>
    if (typeof label.text === "string") {
      patches.label = { ...label, text: normalizeTextContent(label.text) }
    }
  }

  // fix strokeColor: must be a string (LLM sometimes outputs a number)
  if (el.type === "text" && (typeof el.strokeColor !== "string" || !el.strokeColor)) {
    patches.strokeColor = TEXT_STROKE_FALLBACK
  }

  // fix backgroundColor: empty string is invalid, normalize to "transparent"
  if (typeof el.backgroundColor === "string" && el.backgroundColor === "") {
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

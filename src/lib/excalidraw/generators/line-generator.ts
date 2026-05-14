import type { LineInput } from "@/schemas/excalidraw/elements/line-schema"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"

export function generateLine(input: LineInput) {
  const { id, x, y, width = 100, height = 0, ...opts } = input
  return {
    type: "line" as const,
    id,
    x,
    y,
    width,
    height,
    strokeColor: opts.strokeColor ?? DEFAULTS.strokeColor,
    strokeWidth: opts.strokeWidth ?? DEFAULTS.strokeWidth,
    strokeStyle: opts.strokeStyle ?? DEFAULTS.strokeStyle,
    roughness: opts.roughness ?? DEFAULTS.roughness,
    opacity: opts.opacity ?? DEFAULTS.opacity,
    groupIds: opts.groupIds ?? [],
    boundElements: null,
  }
}

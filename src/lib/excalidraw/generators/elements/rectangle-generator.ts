import type { RectangleInput } from "@/schemas/excalidraw/elements/rectangle-schema"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"

export function generateRectangle(input: RectangleInput) {
  const { id, x, y, width, height, label, rounded = false, ...opts } = input
  return {
    type: "rectangle" as const,
    id,
    x,
    y,
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    strokeColor: opts.strokeColor ?? DEFAULTS.strokeColor,
    backgroundColor: opts.backgroundColor ?? DEFAULTS.backgroundColor,
    fillStyle: opts.fillStyle ?? DEFAULTS.fillStyle,
    strokeWidth: opts.strokeWidth ?? DEFAULTS.strokeWidth,
    strokeStyle: opts.strokeStyle ?? DEFAULTS.strokeStyle,
    roughness: opts.roughness ?? DEFAULTS.roughness,
    opacity: opts.opacity ?? DEFAULTS.opacity,
    groupIds: opts.groupIds ?? [],
    boundElements: opts.boundElements ?? null,
    ...(label && { label }),
    ...(rounded && { roundness: { type: 3 as const } }),
  }
}

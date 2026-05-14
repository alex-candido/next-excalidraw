import type { DiamondInput } from "@/schemas/excalidraw/diamond-schema"
import { DEFAULTS } from "@/schemas/excalidraw/base-shape-schema"

export function generateDiamond(input: DiamondInput) {
  const { id, x, y, width, height, label, ...opts } = input
  return {
    type: "diamond" as const,
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
  }
}

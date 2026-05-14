import type { ArrowInput } from "@/schemas/excalidraw/arrow-schema"
import { DEFAULTS } from "@/schemas/excalidraw/base-shape-schema"

export function generateArrow(input: ArrowInput) {
  const {
    id, x, y,
    width = 100,
    height = 0,
    startArrowhead = null,
    endArrowhead = "arrow",
    elbowed,
    label,
    start,
    end,
    startBinding,
    endBinding,
    ...opts
  } = input

  // bug fix: arrow with width === 0 does not render in Excalidraw
  const safeWidth = width === 0 ? 1 : width

  return {
    type: "arrow" as const,
    id,
    x,
    y,
    width: safeWidth,
    height,
    strokeColor: opts.strokeColor ?? DEFAULTS.strokeColor,
    strokeWidth: opts.strokeWidth ?? DEFAULTS.strokeWidth,
    strokeStyle: opts.strokeStyle ?? DEFAULTS.strokeStyle,
    roughness: opts.roughness ?? DEFAULTS.roughness,
    opacity: opts.opacity ?? DEFAULTS.opacity,
    groupIds: opts.groupIds ?? [],
    boundElements: opts.boundElements ?? null,
    startArrowhead,
    endArrowhead,
    ...(elbowed !== undefined && { elbowed }),
    ...(label && { label }),
    ...(start && { start }),
    ...(end && { end }),
    ...(startBinding !== undefined && { startBinding }),
    ...(endBinding !== undefined && { endBinding }),
  }
}

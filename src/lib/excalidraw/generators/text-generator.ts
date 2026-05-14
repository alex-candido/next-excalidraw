import type { TextInput } from "@/schemas/excalidraw/elements/text-schema"
import { TEXT_DEFAULTS } from "@/schemas/excalidraw/elements/text-schema"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"

export function generateText(input: TextInput) {
  const { id, x, y, text, containerId, ...opts } = input
  return {
    type: "text" as const,
    id,
    x,
    y,
    text,
    strokeColor: opts.strokeColor ?? DEFAULTS.textColor,
    backgroundColor: opts.backgroundColor ?? DEFAULTS.backgroundColor,
    fontSize: opts.fontSize ?? TEXT_DEFAULTS.fontSize,
    fontFamily: opts.fontFamily ?? TEXT_DEFAULTS.fontFamily,
    textAlign: opts.textAlign ?? "left",
    verticalAlign: opts.verticalAlign ?? "top",
    opacity: opts.opacity ?? DEFAULTS.opacity,
    groupIds: opts.groupIds ?? [],
    boundElements: null,
    ...(containerId !== undefined && { containerId }),
  }
}

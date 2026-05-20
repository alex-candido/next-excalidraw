import type { ArrowInput } from "@/schemas/excalidraw/elements/arrow-schema"
import type { RectangleInput } from "@/schemas/excalidraw/elements/rectangle-schema"
import type { EllipseInput } from "@/schemas/excalidraw/elements/ellipse-schema"
import type { DiamondInput } from "@/schemas/excalidraw/elements/diamond-schema"
import type { TextInput } from "@/schemas/excalidraw/elements/text-schema"
import type { LineInput } from "@/schemas/excalidraw/elements/line-schema"
import type { FrameInput } from "@/schemas/excalidraw/elements/frame-schema"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"
import { TEXT_DEFAULTS } from "@/schemas/excalidraw/elements/text-schema"

export function elementsGenerator() {
  function arrow(input: ArrowInput) {
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

    const safeWidth = width === 0 ? 1 : width

    return {
      type: "arrow" as const,
      id,
      x,
      y,
      width: safeWidth,
      height,
      strokeColor:    opts.strokeColor    ?? DEFAULTS.strokeColor,
      strokeWidth:    opts.strokeWidth    ?? DEFAULTS.strokeWidth,
      strokeStyle:    opts.strokeStyle    ?? DEFAULTS.strokeStyle,
      roughness:      opts.roughness      ?? DEFAULTS.roughness,
      opacity:        opts.opacity        ?? DEFAULTS.opacity,
      groupIds:       opts.groupIds       ?? [],
      boundElements:  opts.boundElements  ?? null,
      startArrowhead,
      endArrowhead,
      ...(elbowed !== undefined && { elbowed }),
      ...(label        && { label }),
      ...(start        && { start }),
      ...(end          && { end }),
      ...(startBinding !== undefined && { startBinding }),
      ...(endBinding   !== undefined && { endBinding }),
    }
  }

  function rectangle(input: RectangleInput) {
    const { id, x, y, width, height, label, rounded = false, ...opts } = input
    return {
      type: "rectangle" as const,
      id,
      x,
      y,
      ...(width  !== undefined && { width }),
      ...(height !== undefined && { height }),
      strokeColor:    opts.strokeColor    ?? DEFAULTS.strokeColor,
      backgroundColor: opts.backgroundColor ?? DEFAULTS.backgroundColor,
      fillStyle:      opts.fillStyle      ?? DEFAULTS.fillStyle,
      strokeWidth:    opts.strokeWidth    ?? DEFAULTS.strokeWidth,
      strokeStyle:    opts.strokeStyle    ?? DEFAULTS.strokeStyle,
      roughness:      opts.roughness      ?? DEFAULTS.roughness,
      opacity:        opts.opacity        ?? DEFAULTS.opacity,
      groupIds:       opts.groupIds       ?? [],
      boundElements:  opts.boundElements  ?? null,
      ...(label   && { label }),
      ...(rounded && { roundness: { type: 3 as const } }),
    }
  }

  function ellipse(input: EllipseInput) {
    const { id, x, y, width, height, label, ...opts } = input
    return {
      type: "ellipse" as const,
      id,
      x,
      y,
      ...(width  !== undefined && { width }),
      ...(height !== undefined && { height }),
      strokeColor:    opts.strokeColor    ?? DEFAULTS.strokeColor,
      backgroundColor: opts.backgroundColor ?? DEFAULTS.backgroundColor,
      fillStyle:      opts.fillStyle      ?? DEFAULTS.fillStyle,
      strokeWidth:    opts.strokeWidth    ?? DEFAULTS.strokeWidth,
      strokeStyle:    opts.strokeStyle    ?? DEFAULTS.strokeStyle,
      roughness:      opts.roughness      ?? DEFAULTS.roughness,
      opacity:        opts.opacity        ?? DEFAULTS.opacity,
      groupIds:       opts.groupIds       ?? [],
      boundElements:  opts.boundElements  ?? null,
      ...(label && { label }),
    }
  }

  function diamond(input: DiamondInput) {
    const { id, x, y, width, height, label, ...opts } = input
    return {
      type: "diamond" as const,
      id,
      x,
      y,
      ...(width  !== undefined && { width }),
      ...(height !== undefined && { height }),
      strokeColor:    opts.strokeColor    ?? DEFAULTS.strokeColor,
      backgroundColor: opts.backgroundColor ?? DEFAULTS.backgroundColor,
      fillStyle:      opts.fillStyle      ?? DEFAULTS.fillStyle,
      strokeWidth:    opts.strokeWidth    ?? DEFAULTS.strokeWidth,
      strokeStyle:    opts.strokeStyle    ?? DEFAULTS.strokeStyle,
      roughness:      opts.roughness      ?? DEFAULTS.roughness,
      opacity:        opts.opacity        ?? DEFAULTS.opacity,
      groupIds:       opts.groupIds       ?? [],
      boundElements:  opts.boundElements  ?? null,
      ...(label && { label }),
    }
  }

  function text(input: TextInput) {
    const { id, x, y, text: content, containerId, ...opts } = input
    return {
      type: "text" as const,
      id,
      x,
      y,
      text: content,
      strokeColor:    opts.strokeColor    ?? DEFAULTS.textColor,
      backgroundColor: opts.backgroundColor ?? DEFAULTS.backgroundColor,
      fontSize:       opts.fontSize       ?? TEXT_DEFAULTS.fontSize,
      fontFamily:     opts.fontFamily     ?? TEXT_DEFAULTS.fontFamily,
      textAlign:      opts.textAlign      ?? "left",
      verticalAlign:  opts.verticalAlign  ?? "top",
      opacity:        opts.opacity        ?? DEFAULTS.opacity,
      groupIds:       opts.groupIds       ?? [],
      boundElements:  null,
      ...(containerId !== undefined && { containerId }),
    }
  }

  function line(input: LineInput) {
    const { id, x, y, width = 100, height = 0, ...opts } = input
    return {
      type: "line" as const,
      id,
      x,
      y,
      width,
      height,
      strokeColor:  opts.strokeColor  ?? DEFAULTS.strokeColor,
      strokeWidth:  opts.strokeWidth  ?? DEFAULTS.strokeWidth,
      strokeStyle:  opts.strokeStyle  ?? DEFAULTS.strokeStyle,
      roughness:    opts.roughness    ?? DEFAULTS.roughness,
      opacity:      opts.opacity      ?? DEFAULTS.opacity,
      groupIds:     opts.groupIds     ?? [],
      boundElements: null,
    }
  }

  function frame(input: FrameInput) {
    const { id, children, name } = input
    return {
      type: "frame" as const,
      id,
      children,
      ...(name !== undefined && { name }),
    }
  }

  return { arrow, rectangle, ellipse, diamond, text, line, frame }
}

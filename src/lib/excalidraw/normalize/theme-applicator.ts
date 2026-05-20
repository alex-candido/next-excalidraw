import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import type { ExcalidrawThemePalette } from "@/lib/excalidraw/themes/presentation-themes"

type Raw = Record<string, unknown>

const SKIP_TYPES = new Set(["frame", "image", "magicframe"])

function backgroundForFillStyle(fillStyle: string | undefined, palette: ExcalidrawThemePalette): string {
  switch (fillStyle) {
    case "solid":       return palette.primary
    case "cross-hatch": return palette.accent
    default:            return palette.secondary  // hachure, zigzag, etc.
  }
}

export function themeApplicator() {
  function apply(
    skeletons: ExcalidrawElementSkeleton[],
    palette:   ExcalidrawThemePalette,
  ): ExcalidrawElementSkeleton[] {
    return skeletons.map(el => {
      const raw  = el as Raw
      const type = raw.type as string

      if (SKIP_TYPES.has(type)) return el

      const patches: Partial<Raw> = {}

      // strokeColor — text uses text color, everything else uses stroke color
      patches.strokeColor = type === "text" ? palette.text : palette.stroke

      // backgroundColor — only remap non-transparent fills
      const bg        = raw.backgroundColor as string | undefined
      const fillStyle = raw.fillStyle       as string | undefined
      if (bg && bg !== "transparent") {
        patches.backgroundColor = backgroundForFillStyle(fillStyle, palette)
      }

      // label strokeColor (for ValidContainer labels)
      const label = raw.label as Raw | undefined
      if (label) {
        patches.label = { ...label, strokeColor: palette.text }
      }

      return { ...el, ...patches }
    })
  }

  function canvasColor(palette: ExcalidrawThemePalette): string {
    return palette.canvas
  }

  return { apply, canvasColor }
}

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import type { ExcalidrawThemePalette, SemanticPair, SemanticRole } from "@/lib/excalidraw/themes/presentation-themes"

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
    skeletons:      ExcalidrawElementSkeleton[],
    palette:        ExcalidrawThemePalette,
    semanticRoles?: Record<SemanticRole, SemanticPair>,
  ): ExcalidrawElementSkeleton[] {
    return skeletons.map(el => {
      const raw  = el as Raw
      const type = raw.type as string

      if (SKIP_TYPES.has(type)) return el

      const patches: Partial<Raw> = {}

      // `role` (papel semântico, ex: "warning") tem prioridade sobre o
      // fillStyle quando presente — é mais específico (significado, não só
      // peso visual). Sem semanticRoles (chamador não passou tema resolvido)
      // ou sem role reconhecido no elemento, cai no comportamento por
      // fillStyle de sempre.
      const role     = semanticRoles ? (raw.role as SemanticRole | undefined) : undefined
      const rolePair = role ? semanticRoles?.[role] : undefined

      // strokeColor — text uses text color, everything else uses stroke color
      patches.strokeColor = type === "text" ? palette.text : (rolePair?.stroke ?? palette.stroke)

      // backgroundColor — only remap non-transparent fills
      const bg        = raw.backgroundColor as string | undefined
      const fillStyle = raw.fillStyle       as string | undefined
      if (bg && bg !== "transparent") {
        patches.backgroundColor = rolePair?.fill ?? backgroundForFillStyle(fillStyle, palette)
      }

      // label strokeColor (for ValidContainer labels)
      const label = raw.label as Raw | undefined
      if (label) {
        patches.label = { ...label, strokeColor: palette.text }
      }

      // `role` é uma anotação nossa, não um campo real do
      // ExcalidrawElementSkeleton — some depois de resolvido (só quando
      // semanticRoles foi passado, ou seja, esta é a chamada de
      // enriquecimento de verdade; sem isso ainda pode haver uma 2ª chamada
      // adiante que precisa lê-lo). JSON.stringify descarta undefined, então
      // isso também garante que `role` nunca sobreviva no jsonb persistido.
      if (semanticRoles && "role" in raw) {
        patches.role = undefined
      }

      return { ...el, ...patches }
    })
  }

  function canvasColor(palette: ExcalidrawThemePalette): string {
    return palette.canvas
  }

  return { apply, canvasColor }
}

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import { bindingRepairer } from "@/lib/excalidraw/normalize/binding-repairer"
import { elementOrderer } from "@/lib/excalidraw/normalize/element-orderer"
import { arrowNormalizer } from "@/lib/excalidraw/normalize/arrows-normalizer"
import { themeApplicator } from "@/lib/excalidraw/normalize/theme-applicator"
import { textWrapper } from "@/lib/excalidraw/normalize/text-wrapper"
import { gridSnapper } from "@/lib/excalidraw/normalize/grid-snapper"
import type { ExcalidrawThemePalette, SemanticPair, SemanticRole } from "@/lib/excalidraw/themes/presentation-themes"

export type SkeletonEnrichmentContext = {
  palette:       ExcalidrawThemePalette
  semanticRoles: Record<SemanticRole, SemanticPair>
  canvasWidth:   number
  language?:     string
}

// Único ponto de orquestração dos módulos de normalize/. Dois estágios:
//
// 1. Segurança geométrica (sempre) — repair (containerId/boundElements) →
//    order (z-order) → arrows (x/y/width/height de setas vinculadas). Não
//    depende de nada externo à Presentation — roda sempre, mesmo sem saber
//    tema/idioma/canvas (ex: dentro da tool, que só recebe `elements`).
// 2. Enriquecimento (opcional, requer `context`) — theme (cor por role/
//    fillStyle) → text-wrap (quebra de texto livre) → grid-snap (múltiplos
//    de 20px). Só roda quando o chamador passa o contexto resolvido da
//    Presentation (tema, idioma, largura do canvas) — ver slide-workflow.ts.
export function normalizeSkeletons(
  skeletons: ExcalidrawElementSkeleton[],
  context?:  SkeletonEnrichmentContext,
): ExcalidrawElementSkeleton[] {
  const repaired = bindingRepairer().repair(skeletons)
  const ordered = elementOrderer().order(repaired)
  const withArrows = arrowNormalizer().normalize(ordered)

  if (!context) return withArrows

  const themed = themeApplicator().apply(withArrows, context.palette, context.semanticRoles)
  const wrapped = textWrapper().wrap(themed, { canvasWidth: context.canvasWidth, language: context.language })
  return gridSnapper().snap(wrapped)
}

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import { elementParser } from "@/lib/excalidraw/parse/element-parser"
import { normalizeSkeletons, type SkeletonEnrichmentContext } from "@/lib/excalidraw/normalize/skeleton-pipeline"
import { elementSizing } from "@/lib/excalidraw/math/element-sizing"
import { presentationThemes } from "@/lib/excalidraw/themes/presentation-themes"
import { elementsGenerator } from "@/lib/excalidraw/generators/element-generators"

export type { SkeletonEnrichmentContext } from "@/lib/excalidraw/normalize/skeleton-pipeline"
export type {
  ExcalidrawThemeMeta,
  ExcalidrawThemePalette,
  SemanticPair,
  SemanticRole,
} from "@/lib/excalidraw/themes/presentation-themes"

// Ponto único de entrada pra lib/excalidraw — mesma convenção de
// actions/store/hooks (uma factory, um objeto de capacidades relacionadas).
// Dois modos de uso:
//   1. Ações granulares (controle fino) — parse/validate/normalize/size/
//      theme/generate, os mesmos módulos de sempre, agora num só lugar.
//   2. Atalho (`fromAiOutput`) — submete a saída bruta da IA e recebe
//      skeletons prontos (validados + normalizados); com `context`
//      (tema/idioma/canvas resolvidos), ganha o enriquecimento completo de
//      graça (cor por role, quebra de texto, grid) — ver skeleton-pipeline.ts.
//
// `serialize/` (skeleton-serializer.ts) fica DE FORA de propósito:
// `convertToExcalidrawElements` toca `window` na avaliação do módulo, então
// importar estaticamente aqui quebraria qualquer consumidor server-side
// deste arquivo (slide-workflow.ts, slide-structure-tool.ts). Continua
// exigindo import dinâmico client-only (ver use-app-studio-hydration.ts).
export function excalidrawSkeleton() {
  const parser = elementParser()

  return {
    parse:     parser.parse,
    validate:  parser.validate,
    normalize: normalizeSkeletons,
    size:      elementSizing(),
    theme:     presentationThemes(),
    generate:  elementsGenerator(),

    fromAiOutput(raw: unknown[], context?: SkeletonEnrichmentContext): ExcalidrawElementSkeleton[] {
      return normalizeSkeletons(parser.validate(raw), context)
    },
  }
}

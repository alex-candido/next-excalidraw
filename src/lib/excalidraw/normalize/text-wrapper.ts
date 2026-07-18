import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import { elementSizing } from "@/lib/excalidraw/math/element-sizing"

type Raw = Record<string, unknown>

const { calcTextWidth } = elementSizing()

// Texto livre não quebra sozinho (ao contrário de texto vinculado a
// container, que o próprio Excalidraw quebra/redimensiona via
// redrawTextBoundingBox no client) — sem isso a IA precisa calcular `\n`
// manualmente com uma fórmula de caracteres, o mesmo tipo de aritmética que
// já vimos ela errar (ver arrows-normalizer.ts). Heurística aproximada
// (calcTextWidth), não medição real — mas roda server-side, onde não há
// canvas disponível pra medir de verdade.
function wrapLine(line: string, maxWidth: number, language: string): string[] {
  const words = line.split(" ")
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (!current || calcTextWidth(candidate, language) <= maxWidth) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

export function textWrapper() {
  function wrap(
    skeletons: ExcalidrawElementSkeleton[],
    opts: { canvasWidth: number; language?: string },
  ): ExcalidrawElementSkeleton[] {
    const language = opts.language ?? "en"

    return skeletons.map((el) => {
      const raw = el as Raw
      // Só texto livre — bound text (containerId) já é resolvido pelo
      // Excalidraw no client (o container cresce até caber, ver
      // redrawTextBoundingBox), não precisa de heurística nenhuma aqui.
      if (raw.type !== "text" || raw.containerId) return el

      const text = raw.text as string | undefined
      if (!text) return el

      const x = (raw.x as number) ?? 0
      const textAlign = raw.textAlign as string | undefined
      const maxWidth = textAlign === "center"
        ? 2 * Math.min(x, opts.canvasWidth - x) - 20
        : opts.canvasWidth - x - 20

      if (maxWidth <= 0) return el

      const existingLines = text.split("\n")
      const wrapped = existingLines.flatMap((line) => wrapLine(line, maxWidth, language))

      const unchanged = wrapped.length === existingLines.length
        && wrapped.every((line, i) => line === existingLines[i])
      if (unchanged) return el

      return { ...el, text: wrapped.join("\n") } as ExcalidrawElementSkeleton
    })
  }

  return { wrap }
}

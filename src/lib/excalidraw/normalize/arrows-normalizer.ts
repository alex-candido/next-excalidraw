import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

type Edge = "left" | "right" | "top" | "bottom"
type Rect = { x: number; y: number; width: number; height: number }
type Point = { x: number; y: number }
type Raw = Record<string, unknown>

// Usado quando só um lado do binding start/end resolve (a IA esqueceu o
// outro lado) ou nenhum dos dois ids existe no slide — sem isso a seta fica
// sem x/y/width/height, que vira NaN assim que alguém tenta desenhá-la
// (exportToSvg, o próprio editor Excalidraw). Ver docs/adr.md.
const DEFAULT_ARROW_LENGTH = 150

function getRect(el: ExcalidrawElementSkeleton): Rect {
  const raw = el as Raw
  return {
    x: (raw.x as number) ?? 0,
    y: (raw.y as number) ?? 0,
    width: (raw.width as number) ?? 100,
    height: (raw.height as number) ?? 100,
  }
}

function determineEdges(start: Rect, end: Rect): { startEdge: Edge; endEdge: Edge } {
  const dx = (start.x + start.width / 2) - (end.x + end.width / 2)
  const dy = (start.y + start.height / 2) - (end.y + end.height / 2)

  const L2R = start.x - (end.x + end.width)
  const R2L = -((start.x + start.width) - end.x)
  const T2B = start.y - (end.y + end.height)
  const B2T = -((start.y + start.height) - end.y)

  if (dx > 0 && dy > 0) return L2R > T2B ? { startEdge: "left", endEdge: "right" } : { startEdge: "top", endEdge: "bottom" }
  if (dx < 0 && dy > 0) return R2L > T2B ? { startEdge: "right", endEdge: "left" } : { startEdge: "top", endEdge: "bottom" }
  if (dx > 0 && dy < 0) return L2R > B2T ? { startEdge: "left", endEdge: "right" } : { startEdge: "bottom", endEdge: "top" }
  if (dx < 0 && dy < 0) return R2L > B2T ? { startEdge: "right", endEdge: "left" } : { startEdge: "bottom", endEdge: "top" }
  if (dx === 0 && dy > 0) return { startEdge: "top", endEdge: "bottom" }
  if (dx === 0 && dy < 0) return { startEdge: "bottom", endEdge: "top" }
  if (dx > 0) return { startEdge: "left", endEdge: "right" }
  if (dx < 0) return { startEdge: "right", endEdge: "left" }
  return { startEdge: "right", endEdge: "left" }
}

function getEdgeCenter(rect: Rect, edge: Edge): Point {
  switch (edge) {
    case "left":   return { x: rect.x,               y: rect.y + rect.height / 2 }
    case "right":  return { x: rect.x + rect.width,  y: rect.y + rect.height / 2 }
    case "top":    return { x: rect.x + rect.width / 2, y: rect.y }
    case "bottom": return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
  }
}

function hasFiniteGeometry(raw: Raw): boolean {
  return Number.isFinite(raw.x) && Number.isFinite(raw.y)
}

// Number.isFinite(value: unknown) não é um type guard — não estreita
// `unknown` pra `number` no branch verdadeiro do ternário, por isso o cast
// explícito aqui em vez de só `Number.isFinite(raw.x) ? raw.x : 0`.
function finiteOrDefault(value: unknown, fallback: number): number {
  return Number.isFinite(value) ? (value as number) : fallback
}

function applyGeometry(el: ExcalidrawElementSkeleton, start: Point, end: Point): ExcalidrawElementSkeleton {
  const width = end.x - start.x
  const height = end.y - start.y
  return {
    ...el,
    x: start.x,
    y: start.y,
    width: width === 0 ? 1 : width,
    height,
  }
}

function applyFallbackGeometry(el: ExcalidrawElementSkeleton, raw: Raw): ExcalidrawElementSkeleton {
  return {
    ...el,
    x: finiteOrDefault(raw.x, 0),
    y: finiteOrDefault(raw.y, 0),
    width: finiteOrDefault(raw.width, DEFAULT_ARROW_LENGTH),
    height: finiteOrDefault(raw.height, 0),
  }
}

// O prompt proíbe explicitamente a IA de mandar `points` em arrow/line (ver
// ELEM_ARROW), mas ela às vezes manda mesmo assim — um array com
// coordenadas ausentes/inválidas. Se sobrar até convertToExcalidrawElements,
// o caso "arrow" dele dá prioridade a `points` (spread depois do width/
// height default) e recalcula width/height A PARTIR dele
// (getSizeFromPoints), sobrescrevendo em silêncio o x/y/width/height que a
// gente acabou de calcular certo — width/height voltam a ficar NaN mesmo com
// o resto do elemento correto. Por isso: nunca deixar `points` sobreviver
// pra fora daqui, sempre, independente do que a IA mandou.
function withoutPoints(el: ExcalidrawElementSkeleton): ExcalidrawElementSkeleton {
  const raw = el as Raw
  if (!("points" in raw)) return el
  const { points: _points, ...rest } = raw
  return rest as ExcalidrawElementSkeleton
}

export function arrowNormalizer() {
  function normalize(skeletons: ExcalidrawElementSkeleton[]): ExcalidrawElementSkeleton[] {
    const elementMap = new Map<string, ExcalidrawElementSkeleton>()
    for (const el of skeletons) {
      const id = (el as Raw).id as string | undefined
      if (id) elementMap.set(id, el)
    }

    return skeletons.map((el) => {
      const raw = el as Raw
      if (raw.type !== "arrow" && raw.type !== "line") return el

      const startId = (raw.start as Raw | undefined)?.id as string | undefined
      const endId   = (raw.end   as Raw | undefined)?.id as string | undefined

      // Sem binding nenhum — caso válido de seta solta com geometria
      // explícita (ver ELEM_ARROW no prompt); a rede de segurança abaixo
      // cobre o caso raro de vir sem binding E sem x/y.
      if (!startId && !endId) {
        return withoutPoints(hasFiniteGeometry(raw) ? el : applyFallbackGeometry(el, raw))
      }

      const startEl = startId ? elementMap.get(startId) : undefined
      const endEl   = endId ? elementMap.get(endId) : undefined

      if (startEl && endEl) {
        const startRect = getRect(startEl)
        const endRect   = getRect(endEl)
        const { startEdge, endEdge } = determineEdges(startRect, endRect)
        return withoutPoints(applyGeometry(el, getEdgeCenter(startRect, startEdge), getEdgeCenter(endRect, endEdge)))
      }

      // Binding incompleto: só um lado foi informado, ou o id do outro lado
      // não corresponde a nenhum elemento do slide (referência inválida da
      // IA). Ancora no lado que resolveu e usa um comprimento padrão na
      // direção convencional (esquerda→direita) em vez de deixar a seta sem
      // x/y — nunca propagar NaN pro Excalidraw.
      const anchorEl = startEl ?? endEl
      if (anchorEl) {
        const anchorIsStart = !!startEl
        const anchorRect = getRect(anchorEl)
        const anchorPt = getEdgeCenter(anchorRect, anchorIsStart ? "right" : "left")
        const otherPt: Point = anchorIsStart
          ? { x: anchorPt.x + DEFAULT_ARROW_LENGTH, y: anchorPt.y }
          : { x: anchorPt.x - DEFAULT_ARROW_LENGTH, y: anchorPt.y }
        return withoutPoints(applyGeometry(el, anchorIsStart ? anchorPt : otherPt, anchorIsStart ? otherPt : anchorPt))
      }

      // Nenhum dos ids referenciados existe no slide — não tem como inferir
      // posição a partir do binding.
      return withoutPoints(hasFiniteGeometry(raw) ? el : applyFallbackGeometry(el, raw))
    })
  }

  return { normalize }
}

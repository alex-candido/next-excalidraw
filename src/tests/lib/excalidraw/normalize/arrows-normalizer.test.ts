import { describe, it, expect } from "bun:test"
import { arrowNormalizer } from "@/lib/excalidraw/normalize/arrows-normalizer"

const { normalize: normalizeArrows } = arrowNormalizer()
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

function rect(id: string, x: number, y: number, w = 100, h = 60): ExcalidrawElementSkeleton {
  return { type: "rectangle", id, x, y, width: w, height: h } as ExcalidrawElementSkeleton
}

function arrow(id: string, srcId: string, dstId: string): ExcalidrawElementSkeleton {
  return { type: "arrow", id, x: 0, y: 0, start: { id: srcId }, end: { id: dstId } } as ExcalidrawElementSkeleton
}

describe("normalizeArrows", () => {
  it("sets x/y to right edge of src when src is left of dst", () => {
    // src center x=50 < dst center x=350 → src right edge, dst left edge
    const src = rect("src", 0, 100)    // center: 50, 130
    const dst = rect("dst", 300, 100)  // center: 350, 130
    const a   = arrow("a1", "src", "dst")

    const [, , result] = normalizeArrows([src, dst, a])
    const el = result as Record<string, unknown>

    expect(el.x).toBe(100)  // src right edge
    expect(el.y).toBe(130)  // src center y
  })

  it("connects right-to-left when src is right of dst", () => {
    // src center x=350 > dst center x=50 → src left edge, dst right edge
    const src = rect("src", 300, 100)
    const dst = rect("dst", 0, 100)
    const a   = arrow("a1", "src", "dst")

    const [, , result] = normalizeArrows([src, dst, a])
    const el = result as Record<string, unknown>

    expect(el.x).toBe(300)  // src left edge
    expect(el.y).toBe(130)
  })

  it("connects top-to-bottom when src is above dst", () => {
    // src center y=30 < dst center y=230 → src bottom edge, dst top edge
    const src = rect("src", 100, 0)    // center: 150, 30
    const dst = rect("dst", 100, 200)  // center: 150, 230
    const a   = arrow("a1", "src", "dst")

    const [, , result] = normalizeArrows([src, dst, a])
    const el = result as Record<string, unknown>

    expect(el.x).toBe(150)  // src center x
    expect(el.y).toBe(60)   // src bottom edge
  })

  it("connects bottom-to-top when src is below dst", () => {
    // src center y=230 > dst center y=30 → src top edge, dst bottom edge
    const src = rect("src", 100, 200)
    const dst = rect("dst", 100, 0)
    const a   = arrow("a1", "src", "dst")

    const [, , result] = normalizeArrows([src, dst, a])
    const el = result as Record<string, unknown>

    expect(el.x).toBe(150)  // src center x
    expect(el.y).toBe(200)  // src top edge
  })

  it("applies width=0 fix when start and end share the same x", () => {
    // purely vertical arrow → width = endPt.x - startPt.x = 0 → fixed to 1
    const src = rect("src", 100, 0)
    const dst = rect("dst", 100, 200)
    const a   = arrow("a1", "src", "dst")

    const [, , result] = normalizeArrows([src, dst, a])
    const el = result as Record<string, unknown>

    expect(el.width).toBe(1)
  })

  it("does not modify arrow without start/end binding", () => {
    const a = { type: "arrow", id: "a1", x: 10, y: 20, width: 100, height: 0 } as ExcalidrawElementSkeleton
    const [result] = normalizeArrows([a])
    const el = result as Record<string, unknown>

    expect(el.x).toBe(10)
    expect(el.y).toBe(20)
    expect(el.width).toBe(100)
  })

  it("does not modify arrow when referenced element does not exist", () => {
    const a = arrow("a1", "missing-src", "missing-dst")
    const [result] = normalizeArrows([a])
    const el = result as Record<string, unknown>

    expect(el.x).toBe(0)
    expect(el.y).toBe(0)
  })

  it("does not modify non-arrow elements", () => {
    const r = rect("r1", 50, 80)
    const [result] = normalizeArrows([r])
    const el = result as Record<string, unknown>

    expect(el.x).toBe(50)
    expect(el.y).toBe(80)
  })

  it("returns the same number of elements", () => {
    const src = rect("src", 0, 0)
    const dst = rect("dst", 200, 0)
    const a   = arrow("a1", "src", "dst")

    expect(normalizeArrows([src, dst, a])).toHaveLength(3)
  })

  it("strips a `points` field the AI left despite the prompt forbidding it — the exact growth_line_1 production bug (2026-07-19)", () => {
    // convertToExcalidrawElements's arrow case spreads `...element` AFTER
    // setting a default `points`, then recalculates width/height FROM
    // whatever points survived (getSizeFromPoints) — a malformed points
    // array silently overwrites otherwise-correct x/y/width/height with NaN.
    const a = {
      type: "arrow", id: "growth_line_1", x: undefined, y: undefined, width: undefined, height: undefined,
      points: [[undefined, undefined], [undefined, undefined], [undefined, undefined], [undefined, undefined]],
    } as unknown as ExcalidrawElementSkeleton

    const [result] = normalizeArrows([a])
    const el = result as Record<string, unknown>

    expect(Number.isFinite(el.x)).toBe(true)
    expect(Number.isFinite(el.y)).toBe(true)
    expect(Number.isFinite(el.width)).toBe(true)
    expect(Number.isFinite(el.height)).toBe(true)
    expect(el.points).toBeUndefined()
  })

  it("strips `points` even on an already-bound, already-valid arrow", () => {
    const src = rect("src", 0, 0)
    const dst = rect("dst", 200, 0)
    const a = { ...arrow("a1", "src", "dst"), points: [[0, 0], [100, 0]] } as ExcalidrawElementSkeleton

    const [, , result] = normalizeArrows([src, dst, a])
    expect((result as Record<string, unknown>).points).toBeUndefined()
  })

  it("does not touch elements with no `points` key at all (zero-copy)", () => {
    const a = { type: "arrow", id: "a1", x: 10, y: 20, width: 100, height: 0 } as ExcalidrawElementSkeleton
    const [result] = normalizeArrows([a])
    expect(result).toBe(a)
  })
})

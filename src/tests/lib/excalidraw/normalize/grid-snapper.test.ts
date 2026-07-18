import { describe, it, expect } from "bun:test"
import { gridSnapper } from "@/lib/excalidraw/normalize/grid-snapper"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

const { snap } = gridSnapper()

type Raw = Record<string, unknown>

describe("gridSnapper.snap", () => {
  it("snaps x/y to the nearest multiple of 20 for shapes", () => {
    const el = { type: "rectangle", id: "r1", x: 33, y: 11, width: 100, height: 60 } as ExcalidrawElementSkeleton
    const [result] = snap([el])
    const raw = result as Raw
    expect(raw.x).toBe(40)
    expect(raw.y).toBe(20)
  })

  it("snaps width/height for shapes", () => {
    const el = { type: "rectangle", id: "r1", x: 0, y: 0, width: 137, height: 62 } as ExcalidrawElementSkeleton
    const [result] = snap([el])
    const raw = result as Raw
    expect(raw.width).toBe(140)
    expect(raw.height).toBe(60)
  })

  it("leaves already-aligned values untouched (zero-copy)", () => {
    const el = { type: "rectangle", id: "r1", x: 100, y: 200, width: 160, height: 60 } as ExcalidrawElementSkeleton
    const [result] = snap([el])
    expect(result).toBe(el)
  })

  it("does not snap width/height on arrows — preserves the width:1 render fix", () => {
    const el = { type: "arrow", id: "a1", x: 33, y: 11, width: 1, height: 0 } as ExcalidrawElementSkeleton
    const [result] = snap([el])
    const raw = result as Raw
    expect(raw.width).toBe(1)
    expect(raw.height).toBe(0)
    // x/y still snapped
    expect(raw.x).toBe(40)
    expect(raw.y).toBe(20)
  })

  it("does not snap width/height on lines", () => {
    const el = { type: "line", id: "l1", x: 60, y: 220, width: 1, height: 0 } as ExcalidrawElementSkeleton
    const [result] = snap([el])
    expect((result as Raw).width).toBe(1)
  })

  it("skips fields that are not finite (undefined width on a frame)", () => {
    const el = { type: "frame", id: "f1", x: 33, y: 11, children: [] } as ExcalidrawElementSkeleton
    const [result] = snap([el])
    const raw = result as Raw
    expect(raw.x).toBe(40)
    expect(raw.y).toBe(20)
    expect(raw.width).toBeUndefined()
  })

  it("respects a custom grid size", () => {
    const el = { type: "rectangle", id: "r1", x: 14, y: 16, width: 100, height: 60 } as ExcalidrawElementSkeleton
    const [result] = snap([el], 10)
    const raw = result as Raw
    expect(raw.x).toBe(10)
    expect(raw.y).toBe(20)
  })

  it("returns the same number of elements", () => {
    const els = [
      { type: "rectangle", id: "r1", x: 0, y: 0 } as ExcalidrawElementSkeleton,
      { type: "text", id: "t1", x: 5, y: 5, text: "hi" } as ExcalidrawElementSkeleton,
    ]
    expect(snap(els)).toHaveLength(2)
  })
})

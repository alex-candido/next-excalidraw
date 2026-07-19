import { describe, it, expect } from "bun:test"
import { frameBoundsResolver } from "@/lib/excalidraw/normalize/frame-bounds-resolver"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

const { resolve } = frameBoundsResolver()

type Raw = Record<string, unknown>

function rect(id: string, x: number, y: number, width: number, height: number): ExcalidrawElementSkeleton {
  return { type: "rectangle", id, x, y, width, height } as ExcalidrawElementSkeleton
}

describe("frameBoundsResolver", () => {
  it("computes bounds as the union bbox of children + 10px margin — the exact production bug (comparison_matrix frame with no id/x/y/width/height despite 8 valid children)", () => {
    const frame = {
      type: "frame", id: "frame_1", children: ["a", "b"],
    } as ExcalidrawElementSkeleton
    const a = rect("a", 100, 200, 50, 50)   // spans 100..150, 200..250
    const b = rect("b", 300, 400, 60, 60)   // spans 300..360, 400..460

    const [frameOut] = resolve([frame, a, b])
    const raw = frameOut as Raw

    expect(raw.x).toBe(90)       // 100 - 10
    expect(raw.y).toBe(190)      // 200 - 10
    expect(raw.width).toBe(280)  // (360 - 100) + 20
    expect(raw.height).toBe(280) // (460 - 200) + 20
  })

  it("recomputes bounds even when the AI already provided x/y/width/height (never trust AI-provided frame geometry)", () => {
    const frame = {
      type: "frame", id: "frame_2", x: 0, y: 0, width: 9999, height: 9999,
      children: ["a"],
    } as ExcalidrawElementSkeleton
    const a = rect("a", 100, 100, 50, 50)

    const [frameOut] = resolve([frame, a])
    const raw = frameOut as Raw

    expect(raw.x).toBe(90)
    expect(raw.width).toBe(70)
  })

  it("defaults to a safe fallback rect when the frame has no children at all", () => {
    const frame = { type: "frame", id: "frame_3", children: [] } as ExcalidrawElementSkeleton
    const [frameOut] = resolve([frame])
    const raw = frameOut as Raw

    expect(raw.x).toBe(0)
    expect(raw.y).toBe(0)
    expect(raw.width).toBe(100)
    expect(raw.height).toBe(100)
  })

  it("leaves a childless frame with already-finite geometry untouched", () => {
    const frame = { type: "frame", id: "frame_4", x: 5, y: 5, width: 50, height: 50, children: [] } as ExcalidrawElementSkeleton
    const [frameOut] = resolve([frame])
    expect(frameOut).toBe(frame)
  })

  it("does not touch non-frame elements", () => {
    const a = rect("a", 0, 0, 100, 100)
    const [result] = resolve([a])
    expect(result).toBe(a)
  })

  it("falls back to a default rect for a child missing its own geometry instead of propagating NaN", () => {
    const frame = { type: "frame", id: "frame_5", children: ["broken", "a"] } as ExcalidrawElementSkeleton
    const broken = { type: "rectangle", id: "broken" } as ExcalidrawElementSkeleton
    const a = rect("a", 500, 500, 20, 20)

    const [frameOut] = resolve([frame, broken, a])
    const raw = frameOut as Raw

    expect(Number.isFinite(raw.x)).toBe(true)
    expect(Number.isFinite(raw.y)).toBe(true)
    expect(Number.isFinite(raw.width)).toBe(true)
    expect(Number.isFinite(raw.height)).toBe(true)
  })
})

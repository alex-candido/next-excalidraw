import { describe, it, expect } from "bun:test"
import { elementOrderer } from "@/lib/excalidraw/normalize/element-orderer"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

const { order } = elementOrderer()

type Raw = Record<string, unknown>
const types = (els: ExcalidrawElementSkeleton[]) => els.map(el => (el as Raw).type)
const ids   = (els: ExcalidrawElementSkeleton[]) => els.map(el => (el as Raw).id)

describe("elementOrderer", () => {
  it("places frames before all other elements", () => {
    const arrow  = { type: "arrow",     id: "a", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const rect   = { type: "rectangle", id: "r", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const frame  = { type: "frame",     id: "f", x: 0, y: 0, children: [] } as ExcalidrawElementSkeleton

    const result = order([arrow, rect, frame])
    expect(types(result)[0]).toBe("frame")
  })

  it("places arrows after all non-arrow elements", () => {
    const arrow  = { type: "arrow",     id: "a", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const text   = { type: "text",      id: "t", x: 0, y: 0, text: "hi" } as ExcalidrawElementSkeleton
    const rect   = { type: "rectangle", id: "r", x: 0, y: 0 } as ExcalidrawElementSkeleton

    const result = order([arrow, text, rect])
    expect(types(result).at(-1)).toBe("arrow")
  })

  it("places lines before shapes", () => {
    const rect = { type: "rectangle", id: "r", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const line = { type: "line",      id: "l", x: 0, y: 0 } as ExcalidrawElementSkeleton

    const result = order([rect, line])
    expect(ids(result)).toEqual(["l", "r"])
  })

  it("inserts bound text immediately after its container", () => {
    const rect  = { type: "rectangle", id: "box",    x: 0, y: 0 } as ExcalidrawElementSkeleton
    const arrow = { type: "arrow",     id: "arr",    x: 0, y: 0 } as ExcalidrawElementSkeleton
    const text  = {
      type: "text", id: "lbl", x: 0, y: 0, text: "label",
      containerId: "box",
    } as ExcalidrawElementSkeleton

    const result = order([arrow, text, rect])
    const resultIds = ids(result)

    const boxIdx = resultIds.indexOf("box")
    const lblIdx = resultIds.indexOf("lbl")
    const arrIdx = resultIds.indexOf("arr")

    expect(lblIdx).toBe(boxIdx + 1)
    expect(arrIdx).toBeGreaterThan(lblIdx)
  })

  it("handles standalone text before arrows", () => {
    const arrow = { type: "arrow", id: "a", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const text  = { type: "text",  id: "t", x: 0, y: 0, text: "note" } as ExcalidrawElementSkeleton

    const result = order([arrow, text])
    expect(ids(result)).toEqual(["t", "a"])
  })

  it("appends orphaned bound text (container missing) at the end", () => {
    const arrow = { type: "arrow", id: "a", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const text  = {
      type: "text", id: "t", x: 0, y: 0, text: "orphan",
      containerId: "ghost",
    } as ExcalidrawElementSkeleton

    const result    = order([arrow, text])
    const resultIds = ids(result)
    expect(resultIds.at(-1)).toBe("t")
  })

  it("preserves relative order within the same layer", () => {
    const r1 = { type: "rectangle", id: "r1", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const r2 = { type: "rectangle", id: "r2", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const r3 = { type: "rectangle", id: "r3", x: 0, y: 0 } as ExcalidrawElementSkeleton

    const result = order([r1, r2, r3])
    expect(ids(result)).toEqual(["r1", "r2", "r3"])
  })
})

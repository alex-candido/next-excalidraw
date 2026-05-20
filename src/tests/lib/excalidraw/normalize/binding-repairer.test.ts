import { describe, it, expect } from "bun:test"
import { bindingRepairer } from "@/lib/excalidraw/normalize/binding-repairer"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

const { repair } = bindingRepairer()

type Raw = Record<string, unknown>

describe("bindingRepairer", () => {
  it("adds boundElements entry on container when text has containerId but container lacks it", () => {
    const container = { type: "rectangle", id: "rect_1", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const text = {
      type: "text", id: "text_1", x: 10, y: 10, text: "hello",
      containerId: "rect_1",
    } as ExcalidrawElementSkeleton

    const result = repair([container, text])
    const rect = result.find(el => (el as Raw).id === "rect_1") as Raw
    const bound = rect.boundElements as Array<{ type: string; id: string }>

    expect(bound).toBeDefined()
    expect(bound.some(be => be.id === "text_1" && be.type === "text")).toBe(true)
  })

  it("adds containerId on text when container has boundElements entry but text lacks containerId", () => {
    const container = {
      type: "rectangle", id: "rect_2", x: 0, y: 0,
      boundElements: [{ type: "text", id: "text_2" }],
    } as ExcalidrawElementSkeleton
    const text = { type: "text", id: "text_2", x: 10, y: 10, text: "world" } as ExcalidrawElementSkeleton

    const result  = repair([container, text])
    const textOut = result.find(el => (el as Raw).id === "text_2") as Raw

    expect(textOut.containerId).toBe("rect_2")
  })

  it("does not modify elements when binding is already correct", () => {
    const container = {
      type: "rectangle", id: "rect_3", x: 0, y: 0,
      boundElements: [{ type: "text", id: "text_3" }],
    } as ExcalidrawElementSkeleton
    const text = {
      type: "text", id: "text_3", x: 10, y: 10, text: "ok",
      containerId: "rect_3",
    } as ExcalidrawElementSkeleton

    const result = repair([container, text])
    expect(result[0]).toBe(container)
    expect(result[1]).toBe(text)
  })

  it("ignores text without containerId", () => {
    const text = { type: "text", id: "text_4", x: 0, y: 0, text: "standalone" } as ExcalidrawElementSkeleton
    const result = repair([text])
    expect(result[0]).toBe(text)
  })

  it("ignores containerId pointing to a non-existent element", () => {
    const text = {
      type: "text", id: "text_5", x: 0, y: 0, text: "orphan",
      containerId: "missing_id",
    } as ExcalidrawElementSkeleton
    const result = repair([text])
    expect(result[0]).toBe(text)
  })

  it("skips non-text entries in boundElements", () => {
    const container = {
      type: "rectangle", id: "rect_6", x: 0, y: 0,
      boundElements: [{ type: "arrow", id: "arrow_6" }],
    } as ExcalidrawElementSkeleton
    const arrow = { type: "arrow", id: "arrow_6", x: 0, y: 0 } as ExcalidrawElementSkeleton

    const result  = repair([container, arrow])
    const arrowOut = result.find(el => (el as Raw).id === "arrow_6") as Raw

    expect(arrowOut.containerId).toBeUndefined()
  })

  it("repairs both directions simultaneously", () => {
    const container = { type: "rectangle", id: "rect_7", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const text      = {
      type: "text", id: "text_7", x: 0, y: 0, text: "both",
      containerId: "rect_7",
    } as ExcalidrawElementSkeleton

    const result    = repair([container, text])
    const rectOut   = result.find(el => (el as Raw).id === "rect_7") as Raw
    const textOut   = result.find(el => (el as Raw).id === "text_7") as Raw
    const bound     = rectOut.boundElements as Array<{ type: string; id: string }>

    expect(bound.some(be => be.id === "text_7")).toBe(true)
    expect(textOut.containerId).toBe("rect_7")
  })
})

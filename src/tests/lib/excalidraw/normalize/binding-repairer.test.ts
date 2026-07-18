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

  it("adds child id to frame.children when a child has frameId but frame lacks it — the exact bug found in production (2026-07-19)", () => {
    const frame = { type: "frame", id: "frame_1", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const child = { type: "rectangle", id: "rect_child", x: 10, y: 10, frameId: "frame_1" } as ExcalidrawElementSkeleton

    const result   = repair([frame, child])
    const frameOut = result.find(el => (el as Raw).id === "frame_1") as Raw

    expect(Array.isArray(frameOut.children)).toBe(true)
    expect(frameOut.children as string[]).toContain("rect_child")
  })

  it("adds frameId to child when frame has children but child lacks frameId", () => {
    const frame = { type: "frame", id: "frame_2", x: 0, y: 0, children: ["rect_child_2"] } as ExcalidrawElementSkeleton
    const child = { type: "rectangle", id: "rect_child_2", x: 10, y: 10 } as ExcalidrawElementSkeleton

    const result   = repair([frame, child])
    const childOut = result.find(el => (el as Raw).id === "rect_child_2") as Raw

    expect(childOut.frameId).toBe("frame_2")
  })

  it("defaults children to [] on a frame with no children reference at all", () => {
    const frame = { type: "frame", id: "frame_3", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const result = repair([frame])
    const frameOut = result[0] as Raw
    expect(frameOut.children).toEqual([])
  })

  it("does not touch a frame that already has a valid children array", () => {
    const frame = { type: "frame", id: "frame_4", x: 0, y: 0, children: ["a", "b"] } as ExcalidrawElementSkeleton
    const result = repair([frame])
    expect(result[0]).toBe(frame)
  })

  it("does not fabricate references for frameId pointing to a non-existent frame", () => {
    const child = { type: "rectangle", id: "rect_orphan", x: 0, y: 0, frameId: "ghost_frame" } as ExcalidrawElementSkeleton
    const result = repair([child])
    expect(result[0]).toBe(child)
  })

  it("repairs multiple children into the same frame (the exact production shape — 3 children per frame)", () => {
    const frame = { type: "frame", id: "frame_5", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const a = { type: "rectangle", id: "a", x: 0, y: 0, frameId: "frame_5" } as ExcalidrawElementSkeleton
    const b = { type: "rectangle", id: "b", x: 0, y: 0, frameId: "frame_5" } as ExcalidrawElementSkeleton
    const c = { type: "text", id: "c", x: 0, y: 0, text: "hi", frameId: "frame_5" } as ExcalidrawElementSkeleton

    const result = repair([frame, a, b, c])
    const frameOut = result.find(el => (el as Raw).id === "frame_5") as Raw

    expect(frameOut.children).toEqual(["a", "b", "c"])
  })
})

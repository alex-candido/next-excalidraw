import { describe, it, expect } from "bun:test"
import { generateArrow } from "@/lib/excalidraw/generators/arrow-generator"

describe("generateArrow", () => {
  it("sets required fields", () => {
    const el = generateArrow({ id: "a1", x: 0, y: 0 })
    expect(el.type).toBe("arrow")
    expect(el.id).toBe("a1")
  })

  it("defaults endArrowhead to arrow", () => {
    const el = generateArrow({ id: "a1", x: 0, y: 0 })
    expect(el.endArrowhead).toBe("arrow")
  })

  it("defaults startArrowhead to null", () => {
    const el = generateArrow({ id: "a1", x: 0, y: 0 })
    expect(el.startArrowhead).toBeNull()
  })

  it("fixes width=0 bug", () => {
    const el = generateArrow({ id: "a1", x: 0, y: 0, width: 0 })
    expect(el.width).toBe(1)
  })

  it("keeps non-zero width", () => {
    const el = generateArrow({ id: "a1", x: 0, y: 0, width: 150 })
    expect(el.width).toBe(150)
  })

  it("boundElements is null when not provided", () => {
    const el = generateArrow({ id: "a1", x: 0, y: 0 })
    expect(el.boundElements).toBeNull()
  })

  it("includes startBinding when provided", () => {
    const binding = { elementId: "rect-1", focus: 0, gap: 5 }
    const el = generateArrow({ id: "a1", x: 0, y: 0, startBinding: binding })
    expect(el.startBinding).toEqual(binding)
  })

  it("includes start/end endpoint bindings when provided", () => {
    const el = generateArrow({
      id: "a1",
      x: 0,
      y: 0,
      start: { id: "rect-1" },
      end: { id: "rect-2" },
    })
    expect(el.start).toEqual({ id: "rect-1" })
    expect(el.end).toEqual({ id: "rect-2" })
  })
})

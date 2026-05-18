import { describe, it, expect } from "bun:test"
import { generateEllipse } from "@/lib/excalidraw/generators/elements/ellipse-generator"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"

describe("generateEllipse", () => {
  it("sets required fields", () => {
    const el = generateEllipse({ id: "e1", x: 10, y: 20 })
    expect(el.type).toBe("ellipse")
    expect(el.id).toBe("e1")
    expect(el.x).toBe(10)
    expect(el.y).toBe(20)
  })

  it("applies defaults", () => {
    const el = generateEllipse({ id: "e1", x: 0, y: 0 })
    expect(el.strokeColor).toBe(DEFAULTS.strokeColor)
    expect(el.backgroundColor).toBe(DEFAULTS.backgroundColor)
    expect(el.fillStyle).toBe(DEFAULTS.fillStyle)
    expect(el.strokeWidth).toBe(DEFAULTS.strokeWidth)
    expect(el.strokeStyle).toBe(DEFAULTS.strokeStyle)
    expect(el.roughness).toBe(DEFAULTS.roughness)
    expect(el.opacity).toBe(DEFAULTS.opacity)
    expect(el.groupIds).toEqual([])
  })

  it("boundElements is null when not provided", () => {
    const el = generateEllipse({ id: "e1", x: 0, y: 0 })
    expect(el.boundElements).toBeNull()
  })

  it("omits width/height when not provided", () => {
    const el = generateEllipse({ id: "e1", x: 0, y: 0 })
    expect(el).not.toHaveProperty("width")
    expect(el).not.toHaveProperty("height")
  })

  it("includes width/height when provided", () => {
    const el = generateEllipse({ id: "e1", x: 0, y: 0, width: 180, height: 100 })
    expect(el.width).toBe(180)
    expect(el.height).toBe(100)
  })

  it("preserves label", () => {
    const label = { text: "Node", fontSize: 14 }
    const el = generateEllipse({ id: "e1", x: 0, y: 0, label })
    expect(el.label).toEqual(label)
  })

  it("omits label when not provided", () => {
    const el = generateEllipse({ id: "e1", x: 0, y: 0 })
    expect(el).not.toHaveProperty("label")
  })

  it("respects explicit overrides", () => {
    const el = generateEllipse({ id: "e1", x: 0, y: 0, strokeColor: "#0000ff", strokeStyle: "dashed", opacity: 80 })
    expect(el.strokeColor).toBe("#0000ff")
    expect(el.strokeStyle).toBe("dashed")
    expect(el.opacity).toBe(80)
  })
})

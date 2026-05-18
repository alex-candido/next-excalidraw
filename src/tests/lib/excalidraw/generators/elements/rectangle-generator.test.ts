import { describe, it, expect } from "bun:test"
import { generateRectangle } from "@/lib/excalidraw/generators/elements/rectangle-generator"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"

describe("generateRectangle", () => {
  it("sets required fields", () => {
    const el = generateRectangle({ id: "r1", x: 10, y: 20 })
    expect(el.type).toBe("rectangle")
    expect(el.id).toBe("r1")
    expect(el.x).toBe(10)
    expect(el.y).toBe(20)
  })

  it("applies defaults", () => {
    const el = generateRectangle({ id: "r1", x: 0, y: 0 })
    expect(el.strokeColor).toBe(DEFAULTS.strokeColor)
    expect(el.strokeWidth).toBe(DEFAULTS.strokeWidth)
    expect(el.roughness).toBe(DEFAULTS.roughness)
    expect(el.opacity).toBe(DEFAULTS.opacity)
    expect(el.groupIds).toEqual([])
  })

  it("boundElements is null when not provided", () => {
    const el = generateRectangle({ id: "r1", x: 0, y: 0 })
    expect(el.boundElements).toBeNull()
  })

  it("adds roundness when rounded=true", () => {
    const el = generateRectangle({ id: "r1", x: 0, y: 0, rounded: true })
    expect(el.roundness).toEqual({ type: 3 })
  })

  it("no roundness by default", () => {
    const el = generateRectangle({ id: "r1", x: 0, y: 0 })
    expect(el).not.toHaveProperty("roundness")
  })

  it("preserves label", () => {
    const label = { text: "API Gateway", fontSize: 18 }
    const el = generateRectangle({ id: "r1", x: 0, y: 0, label })
    expect(el.label).toEqual(label)
  })

  it("omits width/height when not provided", () => {
    const el = generateRectangle({ id: "r1", x: 0, y: 0 })
    expect(el).not.toHaveProperty("width")
    expect(el).not.toHaveProperty("height")
  })

  it("respects explicit overrides", () => {
    const el = generateRectangle({ id: "r1", x: 0, y: 0, strokeColor: "#ff0000", roughness: 0 })
    expect(el.strokeColor).toBe("#ff0000")
    expect(el.roughness).toBe(0)
  })
})

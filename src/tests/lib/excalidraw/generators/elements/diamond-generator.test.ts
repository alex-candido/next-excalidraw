import { describe, it, expect } from "bun:test"
import { generateDiamond } from "@/lib/excalidraw/generators/elements/diamond-generator"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"

describe("generateDiamond", () => {
  it("sets required fields", () => {
    const el = generateDiamond({ id: "d1", x: 10, y: 20 })
    expect(el.type).toBe("diamond")
    expect(el.id).toBe("d1")
    expect(el.x).toBe(10)
    expect(el.y).toBe(20)
  })

  it("applies defaults", () => {
    const el = generateDiamond({ id: "d1", x: 0, y: 0 })
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
    const el = generateDiamond({ id: "d1", x: 0, y: 0 })
    expect(el.boundElements).toBeNull()
  })

  it("omits width/height when not provided", () => {
    const el = generateDiamond({ id: "d1", x: 0, y: 0 })
    expect(el).not.toHaveProperty("width")
    expect(el).not.toHaveProperty("height")
  })

  it("includes width/height when provided", () => {
    const el = generateDiamond({ id: "d1", x: 0, y: 0, width: 200, height: 140 })
    expect(el.width).toBe(200)
    expect(el.height).toBe(140)
  })

  it("preserves label", () => {
    const label = { text: "Decision", fontSize: 16 }
    const el = generateDiamond({ id: "d1", x: 0, y: 0, label })
    expect(el.label).toEqual(label)
  })

  it("omits label when not provided", () => {
    const el = generateDiamond({ id: "d1", x: 0, y: 0 })
    expect(el).not.toHaveProperty("label")
  })

  it("respects explicit overrides", () => {
    const el = generateDiamond({ id: "d1", x: 0, y: 0, strokeColor: "#ff0000", fillStyle: "hachure", roughness: 0 })
    expect(el.strokeColor).toBe("#ff0000")
    expect(el.fillStyle).toBe("hachure")
    expect(el.roughness).toBe(0)
  })
})

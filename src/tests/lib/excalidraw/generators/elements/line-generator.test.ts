import { describe, it, expect } from "bun:test"
import { generateLine } from "@/lib/excalidraw/generators/elements/line-generator"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"

describe("generateLine", () => {
  it("sets required fields", () => {
    const el = generateLine({ id: "l1", x: 10, y: 20 })
    expect(el.type).toBe("line")
    expect(el.id).toBe("l1")
    expect(el.x).toBe(10)
    expect(el.y).toBe(20)
  })

  it("applies defaults", () => {
    const el = generateLine({ id: "l1", x: 0, y: 0 })
    expect(el.strokeColor).toBe(DEFAULTS.strokeColor)
    expect(el.strokeWidth).toBe(DEFAULTS.strokeWidth)
    expect(el.strokeStyle).toBe(DEFAULTS.strokeStyle)
    expect(el.roughness).toBe(DEFAULTS.roughness)
    expect(el.opacity).toBe(DEFAULTS.opacity)
    expect(el.groupIds).toEqual([])
  })

  it("boundElements is always null", () => {
    const el = generateLine({ id: "l1", x: 0, y: 0 })
    expect(el.boundElements).toBeNull()
  })

  it("defaults width to 100 when not provided", () => {
    const el = generateLine({ id: "l1", x: 0, y: 0 })
    expect(el.width).toBe(100)
  })

  it("defaults height to 0 when not provided", () => {
    const el = generateLine({ id: "l1", x: 0, y: 0 })
    expect(el.height).toBe(0)
  })

  it("respects explicit width and height", () => {
    const el = generateLine({ id: "l1", x: 0, y: 0, width: 300, height: 150 })
    expect(el.width).toBe(300)
    expect(el.height).toBe(150)
  })

  it("supports vertical line (width=0)", () => {
    const el = generateLine({ id: "l1", x: 0, y: 0, width: 0, height: 200 })
    expect(el.width).toBe(0)
    expect(el.height).toBe(200)
  })

  it("respects explicit overrides", () => {
    const el = generateLine({ id: "l1", x: 0, y: 0, strokeColor: "#ff0000", strokeStyle: "dotted", strokeWidth: 1 })
    expect(el.strokeColor).toBe("#ff0000")
    expect(el.strokeStyle).toBe("dotted")
    expect(el.strokeWidth).toBe(1)
  })
})

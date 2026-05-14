import { describe, it, expect } from "bun:test"
import { generateText } from "@/lib/excalidraw/generators/text-generator"
import { DEFAULTS } from "@/schemas/excalidraw/elements/base-shape-schema"
import { TEXT_DEFAULTS } from "@/schemas/excalidraw/elements/text-schema"

describe("generateText", () => {
  it("sets required fields", () => {
    const el = generateText({ id: "t1", x: 10, y: 20, text: "Hello" })
    expect(el.type).toBe("text")
    expect(el.id).toBe("t1")
    expect(el.text).toBe("Hello")
  })

  it("always sets strokeColor (text color)", () => {
    const el = generateText({ id: "t1", x: 0, y: 0, text: "x" })
    expect(el.strokeColor).toBeDefined()
    expect(el.strokeColor).toBe(DEFAULTS.textColor)
  })

  it("respects explicit strokeColor", () => {
    const el = generateText({ id: "t1", x: 0, y: 0, text: "x", strokeColor: "#1e293b" })
    expect(el.strokeColor).toBe("#1e293b")
  })

  it("boundElements is always null", () => {
    const el = generateText({ id: "t1", x: 0, y: 0, text: "x" })
    expect(el.boundElements).toBeNull()
  })

  it("applies font defaults", () => {
    const el = generateText({ id: "t1", x: 0, y: 0, text: "x" })
    expect(el.fontSize).toBe(TEXT_DEFAULTS.fontSize)
    expect(el.fontFamily).toBe(TEXT_DEFAULTS.fontFamily)
  })

  it("includes containerId when provided", () => {
    const el = generateText({ id: "t1", x: 0, y: 0, text: "x", containerId: "rect-1" })
    expect(el.containerId).toBe("rect-1")
  })

  it("omits containerId when not provided", () => {
    const el = generateText({ id: "t1", x: 0, y: 0, text: "x" })
    expect(el).not.toHaveProperty("containerId")
  })
})

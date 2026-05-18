import { describe, it, expect } from "bun:test"
import { generateFrame } from "@/lib/excalidraw/generators/elements/frame-generator"

describe("generateFrame", () => {
  it("sets required fields", () => {
    const el = generateFrame({ id: "f1", children: [] })
    expect(el.type).toBe("frame")
    expect(el.id).toBe("f1")
  })

  it("includes children", () => {
    const el = generateFrame({ id: "f1", children: ["r1", "r2", "t1"] })
    expect(el.children).toEqual(["r1", "r2", "t1"])
  })

  it("includes name when provided", () => {
    const el = generateFrame({ id: "f1", children: [], name: "Slide 1" })
    expect(el.name).toBe("Slide 1")
  })

  it("omits name when not provided", () => {
    const el = generateFrame({ id: "f1", children: [] })
    expect(el).not.toHaveProperty("name")
  })

  it("accepts empty children array", () => {
    const el = generateFrame({ id: "f1", children: [] })
    expect(el.children).toEqual([])
  })
})

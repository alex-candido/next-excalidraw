import { describe, it, expect } from "bun:test"
import { parseSkeletons, validateSkeletons } from "@/lib/excalidraw/parse/element-parser"

const rect  = { type: "rectangle", id: "r1", x: 0, y: 0, width: 100, height: 60 }
const text  = { type: "text", id: "t1", x: 0, y: 0, text: "hello", strokeColor: "#000000" }
const arrow = { type: "arrow", id: "a1", x: 0, y: 0 }

describe("validateSkeletons", () => {
  it("keeps elements with valid type", () => {
    const result = validateSkeletons([rect, text, arrow])
    expect(result).toHaveLength(3)
  })

  it("filters elements with invalid type", () => {
    const result = validateSkeletons([rect, { type: "unknown", id: "x1" }, arrow])
    expect(result).toHaveLength(2)
  })

  it("filters elements without type", () => {
    const result = validateSkeletons([rect, { id: "x1", x: 0, y: 0 }])
    expect(result).toHaveLength(1)
  })

  it("filters null and non-object entries", () => {
    const result = validateSkeletons([rect, null, "string", 42])
    expect(result).toHaveLength(1)
  })

  it("applies strokeColor fallback on text missing strokeColor", () => {
    const result = validateSkeletons([{ type: "text", id: "t1", x: 0, y: 0, text: "hi" }])
    expect((result[0] as Record<string, unknown>).strokeColor).toBe("#1e1e1e")
  })

  it("keeps existing strokeColor on text", () => {
    const result = validateSkeletons([text])
    expect((result[0] as Record<string, unknown>).strokeColor).toBe("#000000")
  })

  it("does not apply strokeColor fallback on non-text elements", () => {
    const result = validateSkeletons([{ type: "rectangle", id: "r1", x: 0, y: 0 }])
    expect((result[0] as Record<string, unknown>).strokeColor).toBeUndefined()
  })

  it("accepts all valid types", () => {
    const types = ["rectangle", "ellipse", "diamond", "text", "arrow", "line", "frame"]
    const elements = types.map((type, i) => ({ type, id: `el${i}`, x: 0, y: 0 }))
    expect(validateSkeletons(elements)).toHaveLength(types.length)
  })
})

describe("parseSkeletons", () => {
  it("parses a clean JSON array", () => {
    const input = JSON.stringify([rect, arrow])
    const result = parseSkeletons(input)
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe("rectangle")
    expect(result[1].type).toBe("arrow")
  })

  it("parses array wrapped in ```json code fence", () => {
    const input = "```json\n" + JSON.stringify([rect]) + "\n```"
    const result = parseSkeletons(input)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe("rectangle")
  })

  it("parses array wrapped in ``` code fence without language", () => {
    const input = "```\n" + JSON.stringify([rect]) + "\n```"
    const result = parseSkeletons(input)
    expect(result).toHaveLength(1)
  })

  it("parses array with trailing comma", () => {
    const input = '[{"type":"rectangle","id":"r1","x":0,"y":0},]'
    const result = parseSkeletons(input)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe("rectangle")
  })

  it("parses truncated array missing closing bracket", () => {
    const input = '[{"type":"rectangle","id":"r1","x":0,"y":0}'
    const result = parseSkeletons(input)
    expect(result).toHaveLength(1)
  })

  it("falls back to object extraction when no array found", () => {
    const input = 'here is the element: {"type":"arrow","id":"a1","x":0,"y":0} and another {"type":"rectangle","id":"r1","x":0,"y":0}'
    const result = parseSkeletons(input)
    expect(result).toHaveLength(2)
  })

  it("filters invalid types", () => {
    const input = JSON.stringify([rect, { type: "invalid", id: "x1" }])
    const result = parseSkeletons(input)
    expect(result).toHaveLength(1)
  })

  it("applies strokeColor fallback on text missing strokeColor", () => {
    const input = JSON.stringify([{ type: "text", id: "t1", x: 0, y: 0, text: "hi" }])
    const result = parseSkeletons(input)
    expect((result[0] as Record<string, unknown>).strokeColor).toBe("#1e1e1e")
  })

  it("returns empty array for empty input", () => {
    expect(parseSkeletons("")).toHaveLength(0)
    expect(parseSkeletons("[]")).toHaveLength(0)
  })

  it("returns empty array when no valid elements found", () => {
    expect(parseSkeletons('{"type":"invalid"}')).toHaveLength(0)
  })
})

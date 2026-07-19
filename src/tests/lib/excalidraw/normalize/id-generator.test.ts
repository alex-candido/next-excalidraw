import { describe, it, expect } from "bun:test"
import { idGenerator } from "@/lib/excalidraw/normalize/id-generator"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

const { generate } = idGenerator()

type Raw = Record<string, unknown>

describe("idGenerator", () => {
  it("leaves an element with a valid id untouched (zero-copy)", () => {
    const el = { type: "rectangle", id: "rect_1", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const [result] = generate([el])
    expect(result).toBe(el)
  })

  it("assigns a generated id to an element missing one entirely", () => {
    const el = { type: "rectangle", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const [result] = generate([el])
    const raw = result as Raw
    expect(typeof raw.id).toBe("string")
    expect((raw.id as string).length).toBeGreaterThan(0)
  })

  it("assigns a generated id to an element with an empty-string id", () => {
    const el = { type: "rectangle", id: "", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const [result] = generate([el])
    const raw = result as Raw
    expect(raw.id).not.toBe("")
    expect(typeof raw.id).toBe("string")
  })

  it("assigns distinct ids to two elements both missing an id", () => {
    const a = { type: "rectangle", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const b = { type: "rectangle", x: 100, y: 0 } as ExcalidrawElementSkeleton
    const [aOut, bOut] = generate([a, b])
    expect((aOut as Raw).id).not.toBe((bOut as Raw).id)
  })
})

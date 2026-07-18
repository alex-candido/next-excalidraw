import { describe, it, expect } from "bun:test"
import { textWrapper } from "@/lib/excalidraw/normalize/text-wrapper"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

const { wrap } = textWrapper()

type Raw = Record<string, unknown>

function text(overrides: Partial<Raw> = {}): ExcalidrawElementSkeleton {
  return { type: "text", id: "t1", x: 20, y: 20, text: "hello", ...overrides } as ExcalidrawElementSkeleton
}

describe("textWrapper.wrap", () => {
  it("leaves short text that already fits unchanged", () => {
    const el = text({ text: "hi" })
    const [result] = wrap([el], { canvasWidth: 800 })
    expect(result).toBe(el)
  })

  it("wraps a long single-line text into multiple lines", () => {
    const long = "this is a very long sentence that should not fit on a single line of the canvas at all"
    const el = text({ x: 20, text: long })
    const [result] = wrap([el], { canvasWidth: 300 })
    const raw = result as Raw
    const lines = (raw.text as string).split("\n")
    expect(lines.length).toBeGreaterThan(1)
    // reconstructs the same words, nothing dropped
    expect(lines.join(" ")).toBe(long)
  })

  it("preserves existing manual line breaks and wraps each independently", () => {
    const el = text({
      x: 20,
      text: "short line\nthis is a considerably longer line that will need wrapping for sure",
    })
    const [result] = wrap([el], { canvasWidth: 300 })
    const raw = result as Raw
    const lines = (raw.text as string).split("\n")
    expect(lines[0]).toBe("short line")
    expect(lines.length).toBeGreaterThan(2)
  })

  it("never drops content — a single word longer than maxWidth still gets placed", () => {
    const el = text({ x: 780, text: "supercalifragilisticexpialidocious" })
    const [result] = wrap([el], { canvasWidth: 800 })
    const raw = result as Raw
    expect(raw.text).toContain("supercalifragilisticexpialidocious")
  })

  it("uses a wider budget for centered text (x treated as center point)", () => {
    const long = "centered title that spans a good portion of the slide width"
    const centered = text({ x: 400, textAlign: "center", text: long })
    const left = text({ id: "t2", x: 400, text: long })

    const [centeredResult] = wrap([centered], { canvasWidth: 800 })
    const [leftResult] = wrap([left], { canvasWidth: 800 })

    const centeredLines = ((centeredResult as Raw).text as string).split("\n").length
    const leftLines = ((leftResult as Raw).text as string).split("\n").length

    expect(centeredLines).toBeLessThanOrEqual(leftLines)
  })

  it("does not touch bound text (containerId present) — Excalidraw resizes the container instead", () => {
    const el = text({ containerId: "box_1", text: "this text is bound to a container and should be left alone" })
    const [result] = wrap([el], { canvasWidth: 200 })
    expect(result).toBe(el)
  })

  it("does not touch non-text elements", () => {
    const rect = { type: "rectangle", id: "r1", x: 0, y: 0, width: 100, height: 60 } as ExcalidrawElementSkeleton
    const [result] = wrap([rect], { canvasWidth: 200 })
    expect(result).toBe(rect)
  })

  it("applies +15% wide-language budget consistently (pt-BR wraps at same width sooner than en)", () => {
    const long = "texto razoavelmente longo para testar quebra de linha automatica aqui"
    const ptEl = text({ x: 20, text: long })
    const enEl = text({ id: "t2", x: 20, text: long })

    const [ptResult] = wrap([ptEl], { canvasWidth: 300, language: "ptBR" })
    const [enResult] = wrap([enEl], { canvasWidth: 300, language: "en" })

    const ptLines = ((ptResult as Raw).text as string).split("\n").length
    const enLines = ((enResult as Raw).text as string).split("\n").length

    expect(ptLines).toBeGreaterThanOrEqual(enLines)
  })

  it("returns the same number of elements", () => {
    const els = [text({ id: "a" }), text({ id: "b", text: "another" })]
    expect(wrap(els, { canvasWidth: 800 })).toHaveLength(2)
  })
})

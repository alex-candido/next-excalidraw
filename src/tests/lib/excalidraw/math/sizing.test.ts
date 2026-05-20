import { elementSizing } from "@/lib/excalidraw/math/element-sizing"
import { describe, expect, it } from "bun:test"

const { calcTextWidth, calcContainerHeight, snapToGrid } = elementSizing()

describe("calcTextWidth", () => {
  it("returns minimum 80 for very short text", () => {
    expect(calcTextWidth("Hi")).toBe(80)
  })

  it("calculates from longest line in multi-line text", () => {
    const text = "short\nthis is the longest line here"
    const longest = "this is the longest line here".length
    expect(calcTextWidth(text)).toBe(Math.max(longest * 8, 80))
  })

  it("applies +15% for ptBR", () => {
    const text = "texto com mais caracteres aqui"
    const base = Math.max(text.length * 8, 80)
    expect(calcTextWidth(text, "ptBR")).toBe(Math.round(base * 1.15))
  })

  it("applies +15% for Spanish", () => {
    const text = "texto con mas caracteres"
    const base = Math.max(text.length * 8, 80)
    expect(calcTextWidth(text, "es")).toBe(Math.round(base * 1.15))
  })

  it("does not apply wide factor for English", () => {
    const text = "some english text here"
    expect(calcTextWidth(text, "en")).toBe(Math.max(text.length * 8, 80))
  })

  it("defaults to English when language omitted", () => {
    const text = "hello world"
    expect(calcTextWidth(text)).toBe(Math.max(text.length * 8, 80))
  })
})

describe("calcContainerHeight", () => {
  it("1 line at fontSize 16", () => {
    expect(calcContainerHeight(1, 16)).toBe(Math.round(1 * 24 + 40))
  })

  it("3 lines at fontSize 20", () => {
    expect(calcContainerHeight(3, 20)).toBe(Math.round(3 * 30 + 40))
  })

  it("custom padding", () => {
    expect(calcContainerHeight(2, 16, 10)).toBe(Math.round(2 * 24 + 20))
  })
})

describe("snapToGrid", () => {
  it("snaps up to nearest 20", () => {
    expect(snapToGrid(33)).toBe(40)
    expect(snapToGrid(11)).toBe(20)
  })

  it("snaps down to nearest 20", () => {
    expect(snapToGrid(29)).toBe(20)
    expect(snapToGrid(9)).toBe(0)
  })

  it("leaves values already on grid unchanged", () => {
    expect(snapToGrid(100)).toBe(100)
    expect(snapToGrid(20)).toBe(20)
    expect(snapToGrid(0)).toBe(0)
  })

  it("respects custom grid size", () => {
    expect(snapToGrid(14, 10)).toBe(10)
    expect(snapToGrid(16, 10)).toBe(20)
  })
})

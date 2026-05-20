import { describe, it, expect } from "bun:test"
import { themeApplicator } from "@/lib/excalidraw/normalize/theme-applicator"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import type { ExcalidrawThemePalette } from "@/lib/excalidraw/themes/presentation-themes"

const { apply, canvasColor } = themeApplicator()

const palette: ExcalidrawThemePalette = {
  canvas:    "#030712",
  stroke:    "#E5E7EB",
  text:      "#E5E7EB",
  primary:   "#818CF8",
  secondary: "#111827",
  accent:    "#60A5FA",
}

type Raw = Record<string, unknown>

describe("themeApplicator.apply", () => {
  it("sets strokeColor to palette.text on text elements", () => {
    const el = { type: "text", id: "t1", x: 0, y: 0, text: "hello", strokeColor: "#000" } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect((result as Raw).strokeColor).toBe(palette.text)
  })

  it("sets strokeColor to palette.stroke on shape elements", () => {
    const el = { type: "rectangle", id: "r1", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect((result as Raw).strokeColor).toBe(palette.stroke)
  })

  it("maps solid fill to palette.primary", () => {
    const el = {
      type: "rectangle", id: "r2", x: 0, y: 0,
      backgroundColor: "#3B82F6", fillStyle: "solid",
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect((result as Raw).backgroundColor).toBe(palette.primary)
  })

  it("maps hachure fill to palette.secondary", () => {
    const el = {
      type: "rectangle", id: "r3", x: 0, y: 0,
      backgroundColor: "#60A5FA", fillStyle: "hachure",
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect((result as Raw).backgroundColor).toBe(palette.secondary)
  })

  it("maps cross-hatch fill to palette.accent", () => {
    const el = {
      type: "rectangle", id: "r4", x: 0, y: 0,
      backgroundColor: "#F3F4F6", fillStyle: "cross-hatch",
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect((result as Raw).backgroundColor).toBe(palette.accent)
  })

  it("leaves transparent backgroundColor unchanged", () => {
    const el = {
      type: "rectangle", id: "r5", x: 0, y: 0,
      backgroundColor: "transparent",
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect((result as Raw).backgroundColor).toBe("transparent")
  })

  it("leaves elements with no backgroundColor without adding one", () => {
    const el = { type: "rectangle", id: "r6", x: 0, y: 0 } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect((result as Raw).backgroundColor).toBeUndefined()
  })

  it("skips frame elements entirely", () => {
    const el = { type: "frame", id: "f1", x: 0, y: 0, children: [] } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect(result).toBe(el)
  })

  it("skips image elements entirely", () => {
    const el = { type: "image", id: "img1", x: 0, y: 0, fileId: "abc" } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect(result).toBe(el)
  })

  it("applies palette.text to label.strokeColor on containers with label", () => {
    const el = {
      type: "rectangle", id: "r7", x: 0, y: 0,
      label: { text: "node", strokeColor: "#000" },
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    const label = (result as Raw).label as Raw
    expect(label.strokeColor).toBe(palette.text)
  })
})

describe("themeApplicator.canvasColor", () => {
  it("returns palette.canvas", () => {
    expect(canvasColor(palette)).toBe(palette.canvas)
  })
})

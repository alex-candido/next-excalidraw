import { describe, it, expect } from "bun:test"
import { normalizeSkeletons } from "@/lib/excalidraw/normalize/skeleton-pipeline"
import { presentationThemes } from "@/lib/excalidraw/themes/presentation-themes"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"

type Raw = Record<string, unknown>

const { getByKey, getSemanticRoles } = presentationThemes()

function buildContext(themeKey: string, canvasWidth = 800) {
  const { palette } = getByKey(themeKey)
  return { palette, semanticRoles: getSemanticRoles(themeKey), canvasWidth, language: "en" }
}

describe("normalizeSkeletons — without context (safety only)", () => {
  it("repairs bindings, orders elements, and fixes arrow geometry", () => {
    const arrow = { type: "arrow", id: "a1", x: 0, y: 0, start: { id: "box" }, end: { id: "missing" } } as ExcalidrawElementSkeleton
    const box   = { type: "rectangle", id: "box", x: 0, y: 0, width: 100, height: 60 } as ExcalidrawElementSkeleton

    const result = normalizeSkeletons([arrow, box])
    const arrowOut = result.find(el => (el as Raw).id === "a1") as Raw

    // one-sided binding (end doesn't resolve) — must still get finite geometry
    expect(Number.isFinite(arrowOut.x)).toBe(true)
    expect(Number.isFinite(arrowOut.y)).toBe(true)
    expect(Number.isFinite(arrowOut.width)).toBe(true)
    expect(Number.isFinite(arrowOut.height)).toBe(true)
  })

  it("assigns distinct ids to elements missing one entirely, before binding-repair runs", () => {
    const a = { type: "text", x: 20, y: 20, text: "título" } as ExcalidrawElementSkeleton
    const b = { type: "text", x: 20, y: 60, text: "subtítulo" } as ExcalidrawElementSkeleton

    const [aOut, bOut] = normalizeSkeletons([a, b])

    expect(typeof (aOut as Raw).id).toBe("string")
    expect(typeof (bOut as Raw).id).toBe("string")
    expect((aOut as Raw).id).not.toBe((bOut as Raw).id)
  })

  it("does not apply theme, text-wrap or grid-snap when context is omitted", () => {
    const el = { type: "rectangle", id: "r1", x: 33, y: 11, backgroundColor: "#anything", fillStyle: "solid", role: "danger" } as ExcalidrawElementSkeleton
    const [result] = normalizeSkeletons([el])
    const raw = result as Raw
    expect(raw.x).toBe(33) // not grid-snapped
    expect(raw.backgroundColor).toBe("#anything") // not theme-resolved
  })
})

describe("normalizeSkeletons — with context (full enrichment)", () => {
  it("resolves role-based colors from the theme", () => {
    const el = { type: "rectangle", id: "r1", x: 20, y: 20, backgroundColor: "#anything", role: "danger" } as ExcalidrawElementSkeleton
    const context = buildContext("daktilo")
    const [result] = normalizeSkeletons([el], context)
    const raw = result as Raw
    expect(raw.backgroundColor).toBe(context.semanticRoles.danger.fill)
    expect(raw.strokeColor).toBe(context.semanticRoles.danger.stroke)
  })

  it("wraps overlong standalone text", () => {
    const long = "this is a very long line of text that will absolutely not fit within a small canvas width"
    const el = { type: "text", id: "t1", x: 20, y: 20, text: long } as ExcalidrawElementSkeleton
    const context = buildContext("daktilo", 300)
    const [result] = normalizeSkeletons([el], context)
    const raw = result as Raw
    expect((raw.text as string).split("\n").length).toBeGreaterThan(1)
  })

  it("snaps final geometry to the grid", () => {
    const el = { type: "rectangle", id: "r1", x: 33, y: 11, width: 137, height: 62 } as ExcalidrawElementSkeleton
    const context = buildContext("daktilo")
    const [result] = normalizeSkeletons([el], context)
    const raw = result as Raw
    expect(raw.x).toBe(40)
    expect(raw.y).toBe(20)
    expect(raw.width).toBe(140)
    expect(raw.height).toBe(60)
  })

  it("resolves different colors for dark themes", () => {
    const el = { type: "rectangle", id: "r1", x: 20, y: 20, backgroundColor: "#anything", role: "warning" } as ExcalidrawElementSkeleton
    const lightContext = buildContext("daktilo")
    const darkContext = buildContext("noir")

    const [lightResult] = normalizeSkeletons([el], lightContext)
    const [darkResult] = normalizeSkeletons([el], darkContext)

    expect((lightResult as Raw).backgroundColor).not.toBe((darkResult as Raw).backgroundColor)
  })

  it("still fixes one-sided arrow bindings when context is present", () => {
    const arrow = { type: "arrow", id: "a1", x: 0, y: 0, start: { id: "node_pc" } } as ExcalidrawElementSkeleton
    const node = { type: "rectangle", id: "node_pc", x: 560, y: 320, width: 100, height: 60 } as ExcalidrawElementSkeleton
    const context = buildContext("daktilo")

    const result = normalizeSkeletons([node, arrow], context)
    const arrowOut = result.find(el => (el as Raw).id === "a1") as Raw

    expect(Number.isFinite(arrowOut.x)).toBe(true)
    expect(Number.isFinite(arrowOut.y)).toBe(true)
  })
})

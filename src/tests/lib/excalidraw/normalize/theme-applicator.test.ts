import { describe, it, expect } from "bun:test"
import { themeApplicator } from "@/lib/excalidraw/normalize/theme-applicator"
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform"
import type { ExcalidrawThemePalette, SemanticPair, SemanticRole } from "@/lib/excalidraw/themes/presentation-themes"

const { apply, canvasColor } = themeApplicator()

const palette: ExcalidrawThemePalette = {
  canvas:    "#030712",
  stroke:    "#E5E7EB",
  text:      "#E5E7EB",
  primary:   "#818CF8",
  secondary: "#111827",
  accent:    "#60A5FA",
}

const semanticRoles: Record<SemanticRole, SemanticPair> = {
  success:  { fill: "#dcfce7", stroke: "#166534" },
  warning:  { fill: "#fef9c3", stroke: "#854d0e" },
  danger:   { fill: "#fee2e2", stroke: "#991b1b" },
  external: { fill: "#f3e8ff", stroke: "#6b21a8" },
  process:  { fill: "#e0f2fe", stroke: "#0369a1" },
  trigger:  { fill: "#fed7aa", stroke: "#c2410c" },
  neutral:  { fill: "#f1f5f9", stroke: "#475569" },
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

describe("themeApplicator.apply — semantic roles (additive)", () => {
  it("uses role's fill/stroke instead of fillStyle mapping when role matches", () => {
    const el = {
      type: "rectangle", id: "r1", x: 0, y: 0,
      backgroundColor: "#anything", fillStyle: "solid", role: "danger",
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette, semanticRoles)
    const raw = result as Raw
    expect(raw.backgroundColor).toBe(semanticRoles.danger.fill)
    expect(raw.strokeColor).toBe(semanticRoles.danger.stroke)
  })

  it("falls back to fillStyle mapping when role is unrecognized", () => {
    const el = {
      type: "rectangle", id: "r2", x: 0, y: 0,
      backgroundColor: "#anything", fillStyle: "solid", role: "not-a-real-role",
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette, semanticRoles)
    const raw = result as Raw
    expect(raw.backgroundColor).toBe(palette.primary)
    expect(raw.strokeColor).toBe(palette.stroke)
  })

  it("falls back to fillStyle mapping when element has no role", () => {
    const el = {
      type: "rectangle", id: "r3", x: 0, y: 0,
      backgroundColor: "#anything", fillStyle: "cross-hatch",
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette, semanticRoles)
    const raw = result as Raw
    expect(raw.backgroundColor).toBe(palette.accent)
  })

  it("ignores role entirely when semanticRoles is not passed (backward compatible)", () => {
    const el = {
      type: "rectangle", id: "r4", x: 0, y: 0,
      backgroundColor: "#anything", fillStyle: "solid", role: "danger",
    } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    const raw = result as Raw
    expect(raw.backgroundColor).toBe(palette.primary)
    expect(raw.strokeColor).toBe(palette.stroke)
  })

  it("does not add a role-driven backgroundColor when element has none at all", () => {
    const el = { type: "rectangle", id: "r5", x: 0, y: 0, role: "success" } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette, semanticRoles)
    expect((result as Raw).backgroundColor).toBeUndefined()
  })

  it("text elements still use palette.text regardless of role", () => {
    const el = { type: "text", id: "t1", x: 0, y: 0, text: "hi", role: "danger" } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette, semanticRoles)
    expect((result as Raw).strokeColor).toBe(palette.text)
  })

  it("strips the role annotation once resolved (semanticRoles passed)", () => {
    const el = { type: "rectangle", id: "r1", x: 0, y: 0, role: "danger" } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette, semanticRoles)
    expect((result as Raw).role).toBeUndefined()
  })

  it("strips an unrecognized role too, once semanticRoles is passed", () => {
    const el = { type: "rectangle", id: "r1", x: 0, y: 0, role: "not-a-real-role" } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette, semanticRoles)
    expect((result as Raw).role).toBeUndefined()
  })

  it("keeps role untouched when semanticRoles is not passed (Estágio 1 only)", () => {
    const el = { type: "rectangle", id: "r1", x: 0, y: 0, role: "danger" } as ExcalidrawElementSkeleton
    const [result] = apply([el], palette)
    expect((result as Raw).role).toBe("danger")
  })
})

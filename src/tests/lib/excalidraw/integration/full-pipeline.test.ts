import { describe, it, expect } from "bun:test"
import { excalidrawSkeleton } from "@/lib/excalidraw"
import { presentationThemes } from "@/lib/excalidraw/themes/presentation-themes"

// Simula a saída bruta que o slideCreatorAgent devolveria via
// slideStructureTool (ExcalidrawElementSkeleton[] com `role`, sem hex) — o
// mesmo formato ensinado em slide-creator-prompt.ts depois do ADR-015.
// Roda tudo pelo caminho real (excalidrawSkeleton().fromAiOutput com o
// context completo, igual slide-workflow.ts monta) e verifica que o
// resultado final é seguro (geometria finita) e correto (cor resolvida,
// texto quebrado, grid alinhado) — incluindo os casos de erro já vistos em
// produção (ADR-014) e novos que a IA pode cometer.

type Raw = Record<string, unknown>

const { getByKey, getSemanticRoles } = presentationThemes()

function buildContext(themeKey: string, canvasWidth = 800) {
  return {
    palette:       getByKey(themeKey).palette,
    semanticRoles: getSemanticRoles(themeKey),
    canvasWidth,
    language:      "en",
  }
}

function assertAllFinite(elements: Raw[]) {
  for (const el of elements) {
    for (const field of ["x", "y", "width", "height"] as const) {
      if (field in el && el[field] !== undefined) {
        expect(Number.isFinite(el[field])).toBe(true)
      }
    }
  }
}

describe("full pipeline — valid AI output (flowchart)", () => {
  const raw = [
    { type: "ellipse",   id: "start",   x: 60,  y: 180, width: 120, height: 60, label: { text: "Início" }, role: "trigger" },
    { type: "rectangle", id: "step_a",  x: 260, y: 180, width: 160, height: 60, label: { text: "Processo" }, role: "process" },
    { type: "diamond",   id: "dec_a",   x: 500, y: 160, width: 140, height: 100, label: { text: "OK?" }, role: "warning" },
    { type: "arrow", x: 0, y: 0, start: { id: "start" }, end: { id: "step_a" }, elbowed: true },
    { type: "arrow", x: 0, y: 0, start: { id: "step_a" }, end: { id: "dec_a" }, elbowed: true },
  ]

  it("resolves without throwing and keeps all 5 elements", () => {
    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo"))
    expect(result).toHaveLength(5)
  })

  it("produces only finite geometry", () => {
    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo")) as Raw[]
    assertAllFinite(result)
  })

  it("resolves role-based colors and strips the role annotation", () => {
    const context = buildContext("daktilo")
    const result = excalidrawSkeleton().fromAiOutput(raw, context) as Raw[]
    const start = result.find(el => el.id === "start")!

    expect(start.role).toBeUndefined()
    expect(start.strokeColor).toBe(context.semanticRoles.trigger.stroke)
  })

  it("survives a JSON round-trip (simulates jsonb persistence) with no NaN/undefined geometry", () => {
    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo"))
    const roundTripped = JSON.parse(JSON.stringify(result)) as Raw[]
    assertAllFinite(roundTripped)
    for (const el of roundTripped) {
      expect(JSON.stringify(el)).not.toContain("NaN")
    }
  })

  it("aligns everything to the 20px grid", () => {
    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo")) as Raw[]
    for (const el of result) {
      if (el.type === "arrow") continue // arrows/lines are exempt (ver grid-snapper.ts)
      if (typeof el.x === "number") expect(el.x as number % 20).toBe(0)
      if (typeof el.y === "number") expect(el.y as number % 20).toBe(0)
    }
  })
})

describe("full pipeline — production bug regression (ADR-014): one-sided arrow binding", () => {
  it("heals an arrow with only `start` (no `end` at all) — the exact link_4 case", () => {
    const raw = [
      { type: "rectangle", id: "node_server", x: 140, y: 80,  width: 100, height: 60 },
      { type: "rectangle", id: "node_pc",     x: 560, y: 320, width: 100, height: 60 },
      { type: "arrow", id: "link_4", start: { id: "node_pc" }, strokeColor: "#334155", endArrowhead: "arrow", backgroundColor: "transparent" },
    ]

    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo")) as Raw[]
    const link = result.find(el => el.id === "link_4")!

    expect(Number.isFinite(link.x)).toBe(true)
    expect(Number.isFinite(link.y)).toBe(true)
    expect(Number.isFinite(link.width)).toBe(true)
    expect(Number.isFinite(link.height)).toBe(true)
  })

  it("heals an arrow whose start/end reference an id that does not exist in the slide", () => {
    const raw = [
      { type: "arrow", id: "ghost_link", start: { id: "node_pc" }, end: { id: "node_totally_made_up" } },
    ]
    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo")) as Raw[]
    assertAllFinite(result)
  })
})

describe("full pipeline — cover slide with overlong text", () => {
  it("wraps a subtitle that would overflow a narrow canvas (e.g. 9:16 aspect ratio)", () => {
    const canvasWidth = 400
    const centerX = 200
    const raw = [
      { type: "text", id: "cover_title", x: centerX, y: 165, text: "Título", fontSize: 36, textAlign: "center" },
      {
        type: "text", id: "cover_subtitle", x: centerX, y: 225,
        text: "This is a considerably long subtitle that describes the presentation in more detail than usual",
        fontSize: 20, textAlign: "center", opacity: 80,
      },
    ]
    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo", canvasWidth)) as Raw[]
    const subtitle = result.find(el => el.id === "cover_subtitle")!
    expect((subtitle.text as string).split("\n").length).toBeGreaterThan(1)
  })
})

describe("full pipeline — malformed AI output does not crash the pipeline", () => {
  it("drops entries with an invalid/missing type instead of throwing", () => {
    const raw = [
      { type: "rectangle", id: "r1", x: 0, y: 0, width: 100, height: 60 },
      { foo: "bar" }, // no `type` at all
      { type: "not-a-real-excalidraw-type", id: "x1" },
      null,
      "a stray string the model hallucinated",
    ]
    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo"))
    expect(result).toHaveLength(1)
  })

  it("falls back gracefully for an unrecognized role instead of crashing", () => {
    const raw = [{ type: "rectangle", id: "r1", x: 20, y: 20, backgroundColor: "#anything", fillStyle: "solid", role: "made-up-role" }]
    const context = buildContext("daktilo")
    const result = excalidrawSkeleton().fromAiOutput(raw, context) as Raw[]
    expect(result[0].backgroundColor).toBe(context.palette.primary) // falls back to fillStyle mapping
    expect(result[0].role).toBeUndefined() // still stripped
  })

  it("handles an arrow bound to a container that was itself dropped for having an invalid type", () => {
    const raw = [
      { type: "not-real", id: "orphan_container", x: 0, y: 0 },
      { type: "arrow", id: "a1", start: { id: "orphan_container" }, end: { id: "also-missing" } },
    ]
    const result = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo")) as Raw[]
    assertAllFinite(result)
  })

  it("handles an empty elements array without throwing", () => {
    const result = excalidrawSkeleton().fromAiOutput([], buildContext("daktilo"))
    expect(result).toHaveLength(0)
  })
})

describe("full pipeline — theme mode affects resolved color, structure stays identical", () => {
  const raw = [
    { type: "rectangle", id: "r1", x: 20, y: 20, width: 100, height: 60, backgroundColor: "#anything", role: "warning" },
  ]

  it("light and dark themes resolve to different but both valid hex colors", () => {
    const light = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo")) as Raw[]
    const dark  = excalidrawSkeleton().fromAiOutput(raw, buildContext("noir")) as Raw[]

    expect(light[0].backgroundColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(dark[0].backgroundColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(light[0].backgroundColor).not.toBe(dark[0].backgroundColor)
  })

  it("produces the same element count and ids regardless of theme", () => {
    const light = excalidrawSkeleton().fromAiOutput(raw, buildContext("daktilo")) as Raw[]
    const dark  = excalidrawSkeleton().fromAiOutput(raw, buildContext("noir")) as Raw[]
    expect(light.map(el => el.id)).toEqual(dark.map(el => el.id))
  })
})

describe("full pipeline — without context (tool-call safety net only)", () => {
  it("still heals arrow geometry but does not resolve role/theme colors", () => {
    const raw = [
      { type: "rectangle", id: "node_pc", x: 560, y: 320, width: 100, height: 60 },
      { type: "arrow", id: "link_4", start: { id: "node_pc" }, backgroundColor: "#anything", role: "danger" },
    ]
    const result = excalidrawSkeleton().fromAiOutput(raw) as Raw[]
    const link = result.find(el => el.id === "link_4")!

    expect(Number.isFinite(link.x)).toBe(true) // Estágio 1 still ran
    expect(link.role).toBe("danger") // Estágio 2 (theme) did not run — role untouched
  })
})

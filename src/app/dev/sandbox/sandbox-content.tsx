"use client"

import { useState } from "react"
import { convertToExcalidrawElements } from "@excalidraw/excalidraw"
import { ExcalidrawEditor } from "@/components/excalidraw/excalidraw-editor"
import { elementsGenerator } from "@/lib/excalidraw/generators/element-generators"
import { COLORS } from "@/schemas/excalidraw/elements/base-shape-schema"

const gen = elementsGenerator()

const GENERATORS = {
  rectangle: () => [
    gen.rectangle({ id: "r1", x: 100, y: 100, width: 200, height: 80, label: { text: "Rectangle" }, rounded: true, backgroundColor: COLORS.primaryFill, strokeColor: COLORS.primaryStroke }),
    gen.rectangle({ id: "r2", x: 380, y: 100, width: 200, height: 80, label: { text: "Sem arredondamento" }, backgroundColor: COLORS.neutralFill, strokeColor: COLORS.neutralStroke }),
    gen.rectangle({ id: "r3", x: 100, y: 240, width: 200, height: 80, label: { text: "Hachure" }, fillStyle: "hachure", backgroundColor: COLORS.warningFill, strokeColor: COLORS.warningStroke }),
    gen.rectangle({ id: "r4", x: 380, y: 240, width: 200, height: 80, label: { text: "Dashed" }, strokeStyle: "dashed", backgroundColor: COLORS.errorFill, strokeColor: COLORS.errorStroke }),
  ],

  ellipse: () => [
    gen.ellipse({ id: "e1", x: 100, y: 100, width: 180, height: 100, label: { text: "Ellipse" }, backgroundColor: COLORS.successFill, strokeColor: COLORS.successStroke }),
    gen.ellipse({ id: "e2", x: 360, y: 100, width: 100, height: 100, label: { text: "Círculo" }, backgroundColor: COLORS.primaryFill, strokeColor: COLORS.primaryStroke }),
  ],

  diamond: () => [
    gen.diamond({ id: "d1", x: 100, y: 80, width: 200, height: 140, label: { text: "Decision" }, backgroundColor: COLORS.warningFill, strokeColor: COLORS.warningStroke }),
    gen.diamond({ id: "d2", x: 380, y: 80, width: 200, height: 140, label: { text: "Hachure" }, fillStyle: "hachure", backgroundColor: COLORS.externalFill, strokeColor: COLORS.externalStroke }),
  ],

  text: () => [
    gen.text({ id: "t1", x: 100, y: 80, text: "Título principal", fontSize: 32, strokeColor: COLORS.textTitle }),
    gen.text({ id: "t2", x: 100, y: 140, text: "Header de seção", fontSize: 24, strokeColor: COLORS.textLabel }),
    gen.text({ id: "t3", x: 100, y: 190, text: "Label de elemento", fontSize: 20, strokeColor: COLORS.textLabel }),
    gen.text({ id: "t4", x: 100, y: 230, text: "Anotação / descrição", fontSize: 16, strokeColor: COLORS.textDescription }),
    gen.text({ id: "t5", x: 100, y: 260, text: "Nota pequena", fontSize: 13, strokeColor: COLORS.textDescription }),
  ],

  arrow: () => [
    gen.rectangle({ id: "src", x: 80, y: 120, width: 140, height: 60, label: { text: "Origem" }, rounded: true, backgroundColor: COLORS.primaryFill, strokeColor: COLORS.primaryStroke, boundElements: [{ id: "a1", type: "arrow" }] }),
    gen.rectangle({ id: "dst", x: 420, y: 120, width: 140, height: 60, label: { text: "Destino" }, rounded: true, backgroundColor: COLORS.processFill, strokeColor: COLORS.processStroke, boundElements: [{ id: "a1", type: "arrow" }] }),
    gen.arrow({ id: "a1", x: 220, y: 150, width: 200, height: 0, startBinding: { elementId: "src", focus: 0, gap: 5 }, endBinding: { elementId: "dst", focus: 0, gap: 5 }, label: { text: "solid" } }),
    gen.arrow({ id: "a2", x: 80, y: 260, width: 480, height: 0, strokeStyle: "dashed", label: { text: "dashed" } }),
    gen.arrow({ id: "a3", x: 80, y: 320, width: 480, height: 0, strokeStyle: "dotted", label: { text: "dotted" } }),
    gen.arrow({ id: "a4", x: 80, y: 380, width: 480, height: 0, startArrowhead: "circle", endArrowhead: "diamond", label: { text: "circle → diamond" } }),
  ],

  line: () => [
    gen.line({ id: "l1", x: 80, y: 100, width: 300, height: 0 }),
    gen.line({ id: "l2", x: 80, y: 160, width: 300, height: 0, strokeStyle: "dashed" }),
    gen.line({ id: "l3", x: 80, y: 220, width: 300, height: 0, strokeStyle: "dotted" }),
    gen.line({ id: "l4", x: 450, y: 80, width: 0, height: 200 }),
    gen.text({ id: "lt1", x: 80, y: 72, text: "solid", fontSize: 13, strokeColor: COLORS.textDescription }),
    gen.text({ id: "lt2", x: 80, y: 132, text: "dashed", fontSize: 13, strokeColor: COLORS.textDescription }),
    gen.text({ id: "lt3", x: 80, y: 192, text: "dotted", fontSize: 13, strokeColor: COLORS.textDescription }),
    gen.text({ id: "lt4", x: 460, y: 72, text: "vertical", fontSize: 13, strokeColor: COLORS.textDescription }),
  ],

  frame: () => [
    gen.rectangle({ id: "fr1", x: 60, y: 60, width: 160, height: 60, label: { text: "Child A" }, backgroundColor: COLORS.primaryFill, strokeColor: COLORS.primaryStroke }),
    gen.rectangle({ id: "fr2", x: 260, y: 60, width: 160, height: 60, label: { text: "Child B" }, backgroundColor: COLORS.successFill, strokeColor: COLORS.successStroke }),
    gen.frame({ id: "frame-1", children: ["fr1", "fr2"], name: "My Frame" }),
  ],
} as const

type GeneratorKey = keyof typeof GENERATORS

const BUTTONS: GeneratorKey[] = ["rectangle", "ellipse", "diamond", "text", "arrow", "line", "frame"]

export function SandboxContent() {
  const [active, setActive] = useState<GeneratorKey>("rectangle")

  const elements = convertToExcalidrawElements(
    GENERATORS[active]() as Parameters<typeof convertToExcalidrawElements>[0],
    { regenerateIds: false },
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <nav style={{ display: "flex", gap: 8, padding: "8px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", alignItems: "center" }}>
        <span style={{ fontWeight: 600, marginRight: 8, color: "#1e293b" }}>Sandbox</span>
        {BUTTONS.map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              padding: "4px 14px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              background: active === key ? "#1e40af" : "#fff",
              color: active === key ? "#fff" : "#334155",
              cursor: "pointer",
              fontWeight: active === key ? 600 : 400,
              fontSize: 14,
            }}
          >
            {key}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1 }}>
        <ExcalidrawEditor
          key={active}
          initialData={{ elements, appState: { viewBackgroundColor: "#ffffff" } }}
        />
      </div>
    </div>
  )
}

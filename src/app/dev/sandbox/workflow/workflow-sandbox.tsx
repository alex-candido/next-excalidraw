"use client"

import { useState, useEffect } from "react"
import { convertToExcalidrawElements } from "@excalidraw/excalidraw"
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"
import { ExcalidrawEditor } from "@/components/excalidraw/excalidraw-editor"

const LANGUAGES = [
  { value: 0, label: "English" },
  { value: 1, label: "Spanish" },
  { value: 2, label: "French" },
  { value: 3, label: "German" },
  { value: 4, label: "Italian" },
  { value: 5, label: "Portuguese (Brazil)" },
  { value: 6, label: "Russian" },
  { value: 7, label: "Chinese" },
  { value: 8, label: "Japanese" },
  { value: 9, label: "Korean" },
]

const ASPECT_RATIOS = [
  { value: 0, label: "16:9" },
  { value: 1, label: "4:3" },
  { value: 2, label: "9:16" },
  { value: 3, label: "1:1" },
  { value: 4, label: "A4" },
]

type OutlineItem = {
  order: number
  type: string
  title: string
  description: string
  concepts: string[]
  representation: string
  layout: string
}

type SlideResult = {
  elements: Record<string, unknown>[]
  metadata: unknown
}

export function WorkflowSandbox() {
  const [tab, setTab] = useState<"outline" | "slide">("outline")

  const [userPrompt, setUserPrompt]         = useState("")
  const [language, setLanguage]             = useState(0)
  const [aspectRatio, setAspectRatio]       = useState(0)
  const [slideCount, setSlideCount]         = useState(0)
  const [outlineLoading, setOutlineLoading] = useState(false)
  const [outlineError, setOutlineError]     = useState<string | null>(null)
  const [outlineTitle, setOutlineTitle]     = useState<string | null>(null)
  const [outlines, setOutlines]             = useState<OutlineItem[]>([])
  const [selectedOutline, setSelectedOutline] = useState<OutlineItem | null>(null)

  const [slideLoading, setSlideLoading] = useState(false)
  const [slideError, setSlideError]     = useState<string | null>(null)
  const [slideResult, setSlideResult]   = useState<SlideResult | null>(null)
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)

  useEffect(() => {
    if (!excalidrawAPI || !slideResult) return
    setTimeout(() => {
      const elements = excalidrawAPI.getSceneElements()
      const boundary = elements.find((el) => el.id === "slide-boundary")
      if (boundary) {
        excalidrawAPI.scrollToContent(boundary, { fitToContent: true, animate: true })
      }
    }, 100)
  }, [excalidrawAPI, slideResult])

  async function generateOutline() {
    setOutlineLoading(true)
    setOutlineError(null)
    setOutlines([])
    setOutlineTitle(null)
    setSelectedOutline(null)
    setSlideResult(null)

    try {
      const res = await fetch("/dev/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt, language, slideCount }),
      })
      const data = await res.json()
      const output = data?.result
      if (!output?.outlines) {
        const err = data?.error
        throw new Error(typeof err === "object" ? (err?.message ?? JSON.stringify(err)) : (err ?? "Resposta inesperada do workflow"))
      }
      setOutlineTitle(output.title)
      setOutlines(output.outlines)
    } catch (e) {
      setOutlineError(e instanceof Error ? e.message : "Erro desconhecido")
    } finally {
      setOutlineLoading(false)
    }
  }

  async function generateSlide(item: OutlineItem) {
    setSelectedOutline(item)
    setTab("slide")
    setSlideLoading(true)
    setSlideError(null)
    setSlideResult(null)

    try {
      const res = await fetch("/dev/api/slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlineId: "sandbox",
          order: item.order,
          type: item.type,
          title: item.title,
          description: item.description,
          concepts: item.concepts,
          representation: item.representation,
          layout: item.layout,
          language,
          aspectRatio,
        }),
      })
      const data = await res.json()
      const output = data?.result
      if (!output?.elements) {
        const err = data?.error
        throw new Error(typeof err === "object" ? (err?.message ?? JSON.stringify(err)) : (err ?? "Resposta inesperada do workflow"))
      }
      setSlideResult(output)
    } catch (e) {
      setSlideError(e instanceof Error ? e.message : "Erro desconhecido")
    } finally {
      setSlideLoading(false)
    }
  }

  const excalidrawElements = slideResult
    ? convertToExcalidrawElements(
        slideResult.elements as Parameters<typeof convertToExcalidrawElements>[0],
        { regenerateIds: false },
      )
    : []

  return (
    <div className="flex flex-col h-screen text-sm font-sans">
      {/* Nav */}
      <nav className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50">
        <span className="font-bold text-slate-800 mr-2">Workflow Sandbox</span>
        <button
          onClick={() => setTab("outline")}
          className={`px-3 py-1 rounded-md border text-sm font-medium cursor-pointer ${tab === "outline" ? "bg-blue-800 text-white border-blue-800" : "bg-white text-slate-600 border-slate-300"}`}
        >
          Outline
        </button>
        <button
          onClick={() => setTab("slide")}
          className={`px-3 py-1 rounded-md border text-sm font-medium cursor-pointer ${tab === "slide" ? "bg-blue-800 text-white border-blue-800" : "bg-white text-slate-600 border-slate-300"}`}
        >
          Slide
        </button>
        {outlineTitle && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
            {outlineTitle}
          </span>
        )}
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-80 border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

            {tab === "outline" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-500 text-xs uppercase tracking-wide">Prompt</label>
                  <textarea
                    rows={4}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o tema da apresentação..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-500 text-xs uppercase tracking-wide">Idioma</label>
                  <select
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={language}
                    onChange={(e) => setLanguage(Number(e.target.value))}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-500 text-xs uppercase tracking-wide">Proporção</label>
                  <select
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(Number(e.target.value))}
                  >
                    {ASPECT_RATIOS.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Slides <span className="text-slate-400 normal-case font-normal">(0 = automático)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                  />
                </div>
                <button
                  onClick={generateOutline}
                  disabled={outlineLoading || !userPrompt.trim()}
                  className="px-4 py-2 bg-blue-800 text-white rounded-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {outlineLoading ? "Gerando..." : "Gerar Outline"}
                </button>
                {outlineError && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">{outlineError}</div>
                )}
              </>
            )}

            {tab === "slide" && selectedOutline && (
              <>
                <div className="font-semibold text-slate-700">Outline selecionado</div>
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">#{selectedOutline.order}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{selectedOutline.type}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">{selectedOutline.representation}</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">{selectedOutline.title}</div>
                  <div className="text-slate-500 text-xs">{selectedOutline.description}</div>
                  {selectedOutline.concepts.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {selectedOutline.concepts.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => generateSlide(selectedOutline)}
                  disabled={slideLoading}
                  className="px-4 py-2 bg-blue-800 text-white rounded-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {slideLoading ? "Gerando..." : "Regerar Slide"}
                </button>
                <button
                  onClick={() => setTab("outline")}
                  className="px-3 py-1 border border-slate-300 rounded-md text-slate-600 text-xs font-medium cursor-pointer hover:bg-slate-50"
                >
                  ← Voltar ao Outline
                </button>
                {slideError && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">{slideError}</div>
                )}
                {slideResult && (
                  <>
                    <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
                      <div className="font-semibold text-slate-500 text-xs uppercase tracking-wide">
                        Elementos gerados: {slideResult.elements.length}
                      </div>
                      <details>
                        <summary className="cursor-pointer text-slate-400 text-xs">Ver JSON</summary>
                        <pre className="mt-2 bg-slate-50 border border-slate-200 rounded-md p-2 text-xs overflow-auto max-h-48">
                          {JSON.stringify(slideResult.elements, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </>
                )}
              </>
            )}

            {tab === "slide" && !selectedOutline && (
              <div className="text-slate-400 text-sm">
                Gere um outline e clique em "→ Slide" em um dos itens.
              </div>
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {tab === "outline" && (
            outlines.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <span className="text-4xl">📋</span>
                <span>{outlineLoading ? "Gerando outline..." : "O outline aparecerá aqui"}</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                {outlines.map((item) => (
                  <div
                    key={item.order}
                    className={`border rounded-lg p-3 flex flex-col gap-2 ${selectedOutline?.order === item.order ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">#{item.order}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{item.type}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">{item.representation}</span>
                      </div>
                      <button
                        onClick={() => generateSlide(item)}
                        className="px-2.5 py-1 border border-blue-700 text-blue-700 rounded-md text-xs font-semibold cursor-pointer hover:bg-blue-50"
                      >
                        → Slide
                      </button>
                    </div>
                    <div className="font-semibold text-slate-800 text-sm">{item.title}</div>
                    <div className="text-slate-500 text-xs">{item.description}</div>
                    {item.concepts.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.concepts.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">{c}</span>
                        ))}
                      </div>
                    )}
                    {item.layout && <div className="text-slate-400 text-xs">layout: {item.layout}</div>}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "slide" && (
            slideResult ? (
              <ExcalidrawEditor
                key={JSON.stringify(slideResult.elements)}
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={{
                  elements: excalidrawElements,
                  appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
                }}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <span className="text-4xl">🎨</span>
                <span>{slideLoading ? "Gerando slide..." : "O canvas aparecerá aqui"}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

# Pipeline: Slide Generation

Internos do `slideWorkflow.start()`. Para o fluxo de orquestração completo, ver `features/presentation-creation.feature.md`.

---

## Steps

```
slideWorkflow.start({ type, title, description, concepts, representation, layout, language })

└── generateSlideStep  [id: "generate-slide"]

      ├── type e representation → convertidos de enum numérico para string antes de enviar
      ├── language → convertido para nome legível via LANGUAGE_NAMES
      │
      ├── buildSlideCreatorPrompt(type, representation)
      │     monta instructions dinâmicas com guias de:
      │     - tipo de slide (cover, content, closing, ...)
      │     - representação visual (flowchart, mindmap, ...)
      │
      ├── slideCreatorAgent.stream(outline context, instructions)
      │     model: Gemini
      │     └── tool call: slideStructureTool({ elements[] })
      │           ├── validateSkeletons() → filtra elementos com type inválido
      │           ├── normalizeArrows()   → recalcula x/y/width/height de setas
      │           │     vinculadas por id (determineEdges + getEdgeCenter)
      │           │     fix: width === 0 → força 1 (bug de render Excalidraw)
      │           └── retorna { elements[], metadata }
      │
      └── slideSemanticScorer
            avalia coerência entre outline (title/description/concepts) e elementos gerados
            score: 0.0–1.0 (0 = incoerente, 1 = totalmente alinhado)
            salvo em Generation.info como { score: number }
            uso atual: observabilidade — não bloqueia nem rejeita o slide
```

---

## Output do workflow

```ts
{
  status: "success" | "failed",
  steps: {
    "generate-slide": {
      payload:   { type, title, description, concepts, representation, layout, language },
      startedAt: number,
      status:    "success" | "failed",
      output: {
        elements: ExcalidrawElementSkeleton[],
        metadata: {
          mastra:  { agentId, traceId, version, duration, steps[] },
          usage:   { promptTokens, completionTokens, totalTokens, cost, currency },
          model:   { name: string, provider: string },
          context: { slideOrder: number, outlineId: string }
        }
      },
      endedAt: number
    }
  },
  result: {
    elements: ExcalidrawElementSkeleton[],
    metadata: { ... }
  }
}
```

---

## Canvas por aspectRatio

| aspectRatio | dimensões |
|-------------|-----------|
| 16:9        | 800×450   |
| 4:3         | 800×600   |
| 9:16        | 450×800   |
| 1:1         | 600×600   |
| A4          | 595×842   |

---

## Pontos de atenção

- `representation` chega pré-validado pelo `outlineWorkflow` — não é revalidado aqui
- Entre 4 e 20 elementos por slide (definido no prompt)
- Skeletons são retornados brutos — o service persiste, o frontend converte via `convertToExcalidrawElements`
- `composition` existe no schema mas não é usado — campo legado da abordagem SlideComposition (abandonada)
- Em falha → workflow lança erro → service atualiza `Generation { status: 3(failed) }`, slide não é inserido

# Flow: Slide Generation

## Entrada

Disparado em `/presentations/[id]/outline` ao confirmar os outlines:

```ts
// Para cada Outline salvo no banco:
{
  outlineId:      string
  type:           number  // 0 cover · 1 agenda · 2 content · 3 summary · 4 closing
  title:          string
  description:    string
  concepts:       string[]
  representation: number  // validado pelo outlineWorkflow — ver restrições por tipo
  layout:         string
  language:       number  // herdado da Presentation
}
```

> `representation` chega já validado pelo `outlineWorkflow` — respeita as restrições por tipo de slide definidas no flow de outline.

## Etapas

```
Para cada outline (execução sequencial):

1. Cria Generation
   { type: 1(slide), status: 0(pending), presentationId }

2. slideWorkflow.start({ type, title, description, concepts, representation, layout, language })

   └── generateSlideStep  [id: "generate-slide"]
         ├── Generation { status: 1(running), startedAt, model, framework, context }
         │
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
         ├── slideSemanticScorer
         │     avalia coerência entre outline e elementos visuais gerados
         │     retorna score → salvo em Generation.info
         │
         ├── persiste Slide no banco
         │     { presentationId, outlineId, order, status: 0(active),
         │       elements,   // ExcalidrawElementSkeleton[] bruto
         │       app_state,  // { viewBackgroundColor: '#ffffff', gridSize: 20 }
         │       files: {} }
         │
         └── Generation { status: 2(completed), completedAt, usage, info }

3. Após todos os slides → Redirect → /presentations/[id]/editor
```

## Saída do workflow

```ts
// slideWorkflow.start() retorna:
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
  input:  { type, title, description, concepts, representation, layout, language },
  result: {        // espelho do output do último step
    elements: ExcalidrawElementSkeleton[],
    metadata: { ... }
  }
}
```

## Saída por slide (persistido no banco)

```ts
{
  slideId:   string
  order:     number
  elements:  ExcalidrawElementSkeleton[]  // armazenado bruto no banco
  app_state: { viewBackgroundColor: string, gridSize: number }
  files:     {}
  status:    0  // active
}
```

## No frontend (editor)

```ts
// slide.elements (skeletons) → elementos finais para o canvas
const elements = convertToExcalidrawElements(slide.elements, { regenerateIds: false })
```

`convertToExcalidrawElements` é client-side only — `@excalidraw/excalidraw` importado com `ssr: false`.

## Pontos de atenção

- Execução **sequencial** — um slide por vez, na ordem do outline
- `representation` chega pré-validado pelo outline workflow — não é revalidado aqui
- Skeletons são salvos brutos no banco — conversão acontece no frontend
- Canvas dinâmico por `aspectRatio`: 16:9 → 800×450 · 4:3 → 800×600 · 9:16 → 450×800 · 1:1 → 600×600 · A4 → 595×842
- Entre 4 e 20 elementos por slide (definido no prompt)
- `composition` existe no schema mas não é usado — campo legado da abordagem SlideComposition (abandonada)
- `thumbnail` é gerado posteriormente — não preenchido nesta etapa
- Em caso de falha → Generation `{ status: 3(failed) }`

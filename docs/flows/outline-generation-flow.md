# Flow: Outline Generation

## Entrada

Submetido em `/presentations/new`:

```ts
{
  userPrompt:  string
  language:    number  // 0 en · 1 es · 2 fr · 3 de · 4 it · 5 pt-BR · 6 ru · 7 zh · 8 ja · 9 ko
  aspectRatio: number  // 0 16:9 · 1 4:3 · 2 9:16 · 3 1:1 · 4 A4 · 5 custom
  slideCount:  number  // número definido pelo usuário
  keywords:    string[] // opcional
}
```

> `visibility` não é campo do form — padrão é `1` (private). Pode ser alterado depois.

## Etapas

```
1. Cria Presentation
   { status: 0(draft), userId, userPrompt, language, aspectRatio,
     slideCount, keywords, visibility: 1(private) }

2. Cria Generation
   { type: 0(outline), status: 0(pending), presentationId }

3. outlineWorkflow.start({ userPrompt, language, slideCount, keywords })

   └── generateOutlineStep  [id: "generate-outline"]
         ├── Generation { status: 1(running), startedAt, model, framework, context }
         │
         ├── slideCount → se > 0 usa o valor, senão instrui "between 5 and 9"
         │
         ├── outlineCreatorAgent.stream(userPrompt + language + slideCount + keywords)
         │     instructions: outlineCreatorPrompt
         │     model: Gemini
         │     └── tool call: outlineStructureTool({ title, outlines[] })
         │           ├── valida campos de cada outline
         │           ├── valida representation por type (ver tabela abaixo)
         │           ├── ordena por order
         │           ├── normaliza strings (trim, filter)
         │           └── retorna { title, outlines[], metadata }
         │
         ├── outlineSemanticScorer
         │     avalia coerência semântica entre userPrompt e outline gerado
         │     retorna score (0–1) → salvo em Outline.score
         │
         ├── persiste Outline[] no banco
         │     { presentationId, order, type, title, description,
         │       concepts, representation, layout, score }
         │
         ├── Presentation { title, status: 1(active) }
         └── Generation { status: 2(completed), completedAt, usage, info }

4. Redirect → /presentations/[id]/outline
```

## Representações por tipo de slide

| type    | representações permitidas                                    |
|---------|--------------------------------------------------------------|
| cover   | auto · infographic                                           |
| agenda  | auto · infographic · mindmap · pyramid · matrix              |
| content | todas (21 opções)                                            |
| summary | auto · infographic · mindmap · pyramid · matrix · venn       |
| closing | auto · infographic                                           |

> Enforçado em dois níveis: **prompt** (instrução ao agente) e **schema Zod** (validação do output da tool call).

## Saída do workflow

```ts
// outlineWorkflow.start() retorna:
{
  status: "success" | "failed",
  steps: {
    "generate-outline": {
      payload:   { userPrompt, language, slideCount, keywords },
      startedAt: number,
      status:    "success" | "failed",
      output: {
        title:    string,
        outlines: OutlineItem[],
        metadata: {
          mastra:  { agentId, traceId, version, duration, steps[] },
          usage:   { promptTokens, completionTokens, totalTokens, cost, currency },
          model:   { name: string, provider: string },
          context: { outlineCount: number, presentationTitle: string }
        }
      },
      endedAt: number
    }
  },
  input:  { userPrompt, language, slideCount, keywords },
  result: {        // espelho do output do último step
    title:    string,
    outlines: OutlineItem[],
    metadata: { ... }
  }
}
```

## Saída por outline (persistido no banco)

```ts
{
  presentationId: string
  title:          string
  outlines: {
    id:             string
    order:          number
    type:           number  // 0 cover · 1 agenda · 2 content · 3 summary · 4 closing
    title:          string
    description:    string
    concepts:       string[]
    representation: number  // 0 auto · 1 flowchart · ... · 20 infographic
    layout:         string
    score:          number
  }[]
}
```

## Pontos de atenção

- `language` é convertido para nome legível antes de enviar ao agente (`LANGUAGE_NAMES`)
- `title` da apresentação vem do outline, não do usuário
- `aspectRatio` é salvo na Presentation mas não é passado ao workflow AI
- `Presentation` fica em `draft` (0) até o outline completar — só então vai para `active` (1)
- `representation` é validado contra as opções permitidas por `type` — output inválido é rejeitado pela tool
- Em caso de falha → Generation `{ status: 3(failed) }`

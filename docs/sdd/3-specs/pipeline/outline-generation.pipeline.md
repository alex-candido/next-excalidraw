# Pipeline: Outline Generation

Internos do `outlineWorkflow.start()`. Para o fluxo de orquestração completo, ver `features/presentation-creation.feature.md`.

---

## Steps

```
outlineWorkflow.start({ userPrompt, language, slideCount, keywords })

└── generateOutlineStep  [id: "generate-outline"]

      ├── slideCount → se > 0 usa o valor, senão instrui "between 5 and 9"
      │
      ├── language → convertido para nome legível via LANGUAGE_NAMES antes de enviar
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
      └── outlineSemanticScorer
            avalia coerência semântica entre userPrompt e outline gerado
            score: 0.0–1.0 (0 = incoerente, 1 = totalmente alinhado)
            salvo em Outline.score de cada item
            uso atual: observabilidade — não bloqueia nem rejeita o outline
```

---

## Representações por tipo de slide

| type    | representações permitidas                                    |
|---------|--------------------------------------------------------------|
| cover   | auto · infographic                                           |
| agenda  | auto · infographic · mindmap · pyramid · matrix              |
| content | todas (21 opções)                                            |
| summary | auto · infographic · mindmap · pyramid · matrix · venn       |
| closing | auto · infographic                                           |

> Enforçado em dois níveis: **prompt** (instrução ao agente) e **schema Zod** (validação do output da tool call).

---

## Output do workflow

```ts
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
  result: {
    title:    string,
    outlines: OutlineItem[],
    metadata: { ... }
  }
}
```

---

## Pontos de atenção

- `representation` é validado contra as opções permitidas por `type` — output inválido é rejeitado pela tool call
- `title` da apresentação vem do outline gerado, não do `userPrompt`
- `aspectRatio` não é passado ao workflow — é salvo na Presentation pelo service
- Em falha → workflow lança erro → service atualiza `Generation { status: 3(failed) }`

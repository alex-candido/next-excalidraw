# Flow: lib/excalidraw

## Visão geral

A `lib/excalidraw` é composta por quatro módulos independentes que juntos cobrem o ciclo completo de vida de um elemento Excalidraw dentro do projeto: **parse → normalize → serialize**, mais um módulo de **generators** para criação programática.

```
LLM output (texto bruto / array)
        │
        ▼
   parse/          → ExcalidrawElementSkeleton[]   (server-side)
        │
        ▼
   normalize/      → ExcalidrawElementSkeleton[]   (server-side)
        │
        ▼
   [banco de dados] → skeletons salvos brutos
        │
        ▼
   serialize/      → ExcalidrawElement[]            (client-side only)
```

---

## Módulos

### parse/  — `element-parser.ts`

Responsável por extrair `ExcalidrawElementSkeleton[]` de qualquer saída bruta do LLM.

**Funções exportadas:**

| Função | Entrada | Saída | Uso |
|--------|---------|-------|-----|
| `parseSkeletons(text)` | string bruta do LLM | `ExcalidrawElementSkeleton[]` | quando o agente responde texto livre |
| `validateSkeletons(raw[])` | array genérico (tool call) | `ExcalidrawElementSkeleton[]` | quando o agente responde via tool call estruturada |

**Pipeline interno do `parseSkeletons`:**
```
1. stripCodeFences   → remove blocos ```json ... ```
2. repairAndParseArray → tenta extrair array JSON, repara trailing commas
3. extractObjects    → fallback: extrai objetos JSON individuais do texto
4. isValidSkeleton   → filtra apenas elementos com `type` válido
                       (rectangle | ellipse | diamond | text | arrow | line | frame)
```

> No flow atual (tool call estruturada via `slideStructureTool`), usa-se `validateSkeletons`. `parseSkeletons` é o fallback para respostas em texto livre.

---

### normalize/ — `arrows-normalizer.ts`

Recalcula `x`, `y`, `width`, `height` de setas (`arrow`) e linhas (`line`) que estão vinculadas por `id` a outros elementos.

**Função exportada:** `normalizeArrows(skeletons[])`

**Algoritmo:**
```
1. Monta um Map<id, skeleton> de todos os elementos
2. Para cada arrow/line com start.id e end.id:
   a. determineEdges(startRect, endRect)
      → calcula qual borda de cada elemento a seta deve tocar
      → baseado nos deltas dx/dy entre os centros
   b. getEdgeCenter(rect, edge)
      → retorna o ponto central da borda escolhida
   c. width  = endPt.x - startPt.x
      height = endPt.y - startPt.y
      fix: width === 0 → força 1 (bug de render do Excalidraw)
3. Retorna o array com as setas corrigidas
```

> Setas sem `start.id` ou `end.id` são retornadas sem modificação.

---

### serialize/ — `skeleton-serializer.ts`

Converte `ExcalidrawElementSkeleton[]` em um documento Excalidraw completo, pronto para ser carregado no canvas.

**Função exportada:** `serializeSkeleton(skeletons[])`

**Saída:**
```ts
{
  type:     "excalidraw",
  version:  2,
  source:   "https://excalidraw.com",
  elements: ExcalidrawElement[],   // via convertToExcalidrawElements
  appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
  files:    {}
}
```

> **Client-side only** — `convertToExcalidrawElements` vem de `@excalidraw/excalidraw`, importado com `ssr: false`. Não pode ser chamado no servidor.

---

### generators/ — element generators

Helpers tipados para criar skeletons de cada tipo de elemento de forma programática. Não são usados no pipeline AI — servem para criação manual e testes (ex: sandbox `/dev/sandbox`).

| Arquivo | Função exportada |
|---------|-----------------|
| `arrow-generator.ts` | `generateArrow(input)` |
| `rectangle-generator.ts` | `generateRectangle(input)` |
| `ellipse-generator.ts` | `generateEllipse(input)` |
| `diamond-generator.ts` | `generateDiamond(input)` |
| `line-generator.ts` | `generateLine(input)` |
| `text-generator.ts` | `generateText(input)` |
| `frame-generator.ts` | `generateFrame(input)` |

Cada generator aplica defaults (`DEFAULTS` de `base-shape-schema`) e inclui o fix de `width === 0 → 1` onde aplicável.

---

## Pontos de atenção

- `validateSkeletons` é o caminho principal (tool call) — `parseSkeletons` é fallback para texto livre
- `normalizeArrows` só atua em setas com `start.id` + `end.id` — vinculação por `type` não é normalizada aqui
- `serializeSkeleton` é **client-side only** — no banco ficam os skeletons brutos
- O fix `width === 0 → 1` existe tanto no `arrows-normalizer` quanto no `arrow-generator` — são caminhos independentes

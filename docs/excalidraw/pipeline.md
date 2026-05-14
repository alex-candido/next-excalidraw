# Excalidraw Pipeline — Passos de Implementação

## Visão Geral

```
IA output → schemas → compose → normalize → serialize → ExcalidrawFile
```

A IA opera no espaço semântico (conteúdo, tipo de layout, relações).
O pipeline opera no espaço geométrico (coordenadas, IDs, bindings).

---

## 1. Schemas — `src/schemas/excalidraw/`

**Arquivo:** `slide-layout-schema.ts`

Valida o output da IA antes de entrar no pipeline. Define o contrato entre o que a IA retorna e o que o compose espera.

**O que implementar:**
- Schema Zod completo do `SlideLayout`
- Campo `representation`: tipo do diagrama (`flowchart`, `mindmap`, `orgchart`, etc.)
- Campo `nodes`: array de nós com `id`, `label`, `type` (shape)
- Campo `edges`: array de arestas com `from`, `to`, `label?`, `style?`
- Campo `layout`: variáveis numéricas fornecidas pela IA (`columns`, `radius`, `startX`, `startY`, `hGap`, `vGap`)
- Campo `style`: paleta de cores e estilos opcionais

**Representações suportadas:**
`flowchart | mindmap | orgchart | sequence | class | er | gantt | timeline | tree | network | architecture | dataflow | state | swimlane | fishbone | pyramid | venn | matrix | funnel | infographic | auto`

---

## 2. Compose — `src/lib/excalidraw/compose/`

**Arquivo:** `layout-composer.ts`

Recebe o `SlideLayout` validado e produz `ExcalidrawElementSkeleton[]` usando os generators.

**O que implementar:**
- Algoritmo de layout **grid**: `x = startX + (i % cols) * hGap`, `y = startY + floor(i / cols) * vGap`
- Algoritmo de layout **radial**: `x = cx + r * cos(angle)`, `y = cy + r * sin(angle)`
- Algoritmo de layout **tree**: top-down com separação por nível
- Por nó: chama `generateRectangle`, `generateEllipse` ou `generateDiamond` conforme `node.type`
- Por aresta: chama `generateArrow` com `start: { id }` e `end: { id }`
- Bidirectional binding: adiciona `boundElements` nos shapes correspondentes às arrows
- Título do slide: chama `generateText` com `fontSize: 28`, posicionado acima do layout

---

## 3. Normalize — `src/lib/excalidraw/normalize/`

**Arquivo:** `arrows-normalizer.ts`

Recebe os skeletons do compose e recalcula as arrows para conectar nas arestas corretas dos shapes.

**O que implementar:**
- `determineEdges(startEl, endEl)`: determina quais arestas usar baseado na posição relativa dos centros
- `getEdgeCenter(el, edge)`: retorna o ponto central da aresta (`left | right | top | bottom`)
- Para cada arrow com `start.id` e `end.id`: recalcula `x`, `y`, `width`, `height`
- Bug fix: se `width === 0` após recalculo, forçar para `1`

**Algoritmo de determineEdges:**
```
dx = cx(start) - cx(end)
dy = cy(start) - cy(end)

Quadrante dx>0,dy>0 → compara L2R vs T2B → left→right ou top→bottom
Quadrante dx<0,dy>0 → compara R2L vs T2B → right→left ou top→bottom
Quadrante dx>0,dy<0 → compara L2R vs B2T → left→right ou bottom→top
Quadrante dx<0,dy<0 → compara R2L vs B2T → right→left ou bottom→top
Linha horizontal (dy=0) → left→right ou right→left
Linha vertical  (dx=0) → top→bottom ou bottom→top
```

---

## 4. Serialize — `src/lib/excalidraw/serialize/`

**Arquivo:** `skeleton-serializer.ts`

Recebe os skeletons normalizados e produz o `ExcalidrawFile` final.

**O que implementar:**
- Chamar `convertToExcalidrawElements(skeletons, { regenerateIds: false })` do `@excalidraw/excalidraw`
- Montar o objeto `ExcalidrawFile` com `type`, `version`, `source`, `elements`, `appState`, `files`
- `appState` padrão: `{ viewBackgroundColor: "#ffffff", gridSize: 20 }`

```ts
import { convertToExcalidrawElements } from "@excalidraw/excalidraw"

export function serializeSkeleton(skeletons): ExcalidrawFile {
  return {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: convertToExcalidrawElements(skeletons, { regenerateIds: false }),
    appState: { viewBackgroundColor: "#ffffff", gridSize: 20 },
    files: {},
  }
}
```

---

## Fluxo Completo

```ts
// 1. IA retorna
const aiOutput = { representation: "flowchart", nodes: [...], edges: [...], layout: {...} }

// 2. Validar
const layout = slideLayoutSchema.parse(aiOutput)

// 3. Compor
const skeletons = composeLayout(layout)

// 4. Normalizar
const normalized = normalizeArrows(skeletons)

// 5. Serializar
const file = serializeSkeleton(normalized)

// 6. Salvar no banco / enviar ao cliente
```

---

## Convenções

- Generators: `<element>-generator.ts` em `src/lib/excalidraw/generators/`
- Schemas: `<name>-schema.ts` em `src/schemas/excalidraw/`
- Serializers: `<name>-serializer.ts` em `src/lib/excalidraw/serialize/`
- Normalizers: `<name>-normalizer.ts` em `src/lib/excalidraw/normalize/`
- Composers: `<name>-composer.ts` em `src/lib/excalidraw/compose/`
- Types e interfaces: sempre em `src/types/**`, nunca inline nos módulos

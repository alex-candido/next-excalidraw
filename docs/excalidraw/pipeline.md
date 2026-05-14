# Excalidraw Pipeline

## Visão Geral

```
slide-workflow (IA)
    ↓
SlideComposition  ← armazenada em SLIDE.composition (jsonb)
    ↓
composeLayout()   ← calcula x, y, width, height de cada elemento
    ↓
normalizeArrows() ← recalcula coordenadas das setas com base nas posições reais
    ↓
serializeSkeleton() ← convertToExcalidrawElements()
    ↓
SLIDE.elements (jsonb)
```

A IA opera no **espaço semântico** — conteúdo, estrutura, relações.
O pipeline opera no **espaço geométrico** — coordenadas, IDs, bindings.

---

## SlideComposition — `src/schemas/excalidraw/slide-composition-schema.ts`

Contrato entre o `slide-workflow` e o `lib/excalidraw`. Union discriminada por `kind`.

| `kind` | Conteúdo |
|--------|----------|
| `title_only` | `title`, `subtitle?` |
| `bullets` | `title`, `items[]` |
| `title_content` | `title`, `representation`, `nodes[]`, `edges[]`, `params?` |
| `two_column` | `title`, `left: {title?, items[]}`, `right: {title?, items[]}` |
| `image_text` | `title`, `imagePrompt`, `body` |
| `full_image` | `imagePrompt` |
| `blank` | — |

Campo `type` compartilhado em todos os variants: `cover | agenda | content | summary | closing`.

---

## Compose — `src/lib/excalidraw/compose/layout-composer.ts`

`composeLayout(composition: SlideComposition): ExcalidrawElementSkeleton[]`

Despacha por `kind`. Algoritmos de posicionamento para `title_content`:

| `representation` | Algoritmo |
|-----------------|-----------|
| `mindmap` | radial — `x = cx + r·cos(angle)`, `y = cy + r·sin(angle)` |
| `tree`, `orgchart` | tree — top-down por nível, centralizado |
| demais | grid — `x = ox + (i % cols)·hGap`, `y = oy + floor(i/cols)·vGap` |

---

## Normalize — `src/lib/excalidraw/normalize/arrows-normalizer.ts`

`normalizeArrows(skeletons): ExcalidrawElementSkeleton[]`

Para cada arrow com `start.id` / `end.id`: determina as arestas corretas dos shapes e recalcula `x`, `y`, `width`, `height`.

---

## Serialize — `src/lib/excalidraw/serialize/skeleton-serializer.ts`

`serializeSkeleton(skeletons): ExcalidrawFile`

Chama `convertToExcalidrawElements(skeletons, { regenerateIds: false })` e monta o objeto `ExcalidrawFile`.

---

## Fluxo de código

```ts
const composition = slideCompositionSchema.parse(aiOutput)
const skeletons   = composeLayout(composition)
const normalized  = normalizeArrows(skeletons)
const file        = serializeSkeleton(normalized)
// → salvar composition em SLIDE.composition
// → salvar file.elements em SLIDE.elements
```

# Pipeline: Excalidraw

## Visão geral

A `lib/excalidraw` cobre o ciclo completo de vida de um skeleton dentro do projeto: **parse → normalize → serialize**, com módulos auxiliares de **math**, **themes** e **generators**.

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
   [banco de dados] → skeletons salvos brutos (jsonb)
        │
        ▼
   serialize/      → ExcalidrawElement[]            (client-side only)
```

> **Regra crítica:** `serialize/` usa `convertToExcalidrawElements` de `@excalidraw/excalidraw` — nunca importar em contexto SSR. O banco armazena sempre skeletons brutos.

---

## Módulos

### parse/ — `element-parser.ts`

Função: `elementParser()` retorna `{ parse, validate }`.

| Método | Entrada | Saída | Quando usar |
|--------|---------|-------|-------------|
| `.parse(text)` | string bruta do LLM | `ExcalidrawElementSkeleton[]` | agente respondeu texto livre (fallback) |
| `.validate(raw[])` | array genérico (tool call) | `ExcalidrawElementSkeleton[]` | caminho principal via `slideStructureTool` |

Ambos aplicam `applyFallbacks`: normaliza `\n` em `text`, garante `strokeColor` e `backgroundColor`, e filtra tipos inválidos (aceita: `rectangle | ellipse | diamond | text | arrow | line | frame`).

**Interno: `json-repairer.ts`**

`jsonRepairer()` retorna `{ stripCodeFences, repairAndParseArray, extractObjects }`. Usado internamente pelo `element-parser` — não deve ser importado diretamente.

Pipeline interno do `.parse(text)`:
```
1. stripCodeFences       → remove blocos ```json … ```
2. repairAndParseArray   → extrai array JSON, repara trailing commas
3. extractObjects        → fallback: extrai objetos JSON individualmente do texto
4. isValidSkeleton       → filtra por type válido
5. applyFallbacks        → garante campos obrigatórios
```

---

### normalize/ — 4 módulos em sequência

Ordem de aplicação dentro do `slideStructureTool`:

```
validate
  → repair    (binding-repairer)
  → order     (element-orderer)
  → normalize (arrows-normalizer)
```

#### `binding-repairer.ts`

Função: `bindingRepairer()` retorna `{ repair }`.

Sincroniza bidireccionalmente os relacionamentos `containerId` ↔ `boundElements` entre textos e seus containers. O LLM frequentemente emite apenas uma das duas direções, causando texto flutuante fora da shape.

```
Pass 1: texto com containerId → garante que container tem boundElements[{ type:"text", id }]
Pass 2: container com boundElements → garante que cada texto tem containerId correto
```

Retorna skeletons inalterados se não há patches necessários (zero-copy).

#### `element-orderer.ts`

Função: `elementOrderer()` retorna `{ order }`.

Ordena os elementos por camada de renderização (z-order), preservando a ordem relativa dentro de cada camada. Textos vinculados (`containerId`) são emitidos imediatamente após seu container.

| Camada | Tipos | Prioridade |
|--------|-------|-----------|
| 0 | frame | fundo |
| 1 | line | |
| 2 | rectangle, ellipse, diamond, image | |
| 3 | text standalone | |
| 4 | arrow | topo |

#### `arrows-normalizer.ts`

Função: `arrowNormalizer()` retorna `{ normalize }`.

Recalcula `x`, `y`, `width`, `height` de setas e linhas vinculadas por `start.id` / `end.id`.

```
Para cada arrow/line com start.id e end.id:
  1. determineEdges(startRect, endRect)
     → qual borda de cada elemento a seta deve tocar (baseado em dx/dy entre centros)
  2. getEdgeCenter(rect, edge)
     → ponto central da borda escolhida
  3. width  = endPt.x - startPt.x
     height = endPt.y - startPt.y
     fix: width === 0 → força 1 (bug de render do Excalidraw)
```

Setas sem `start.id` ou `end.id` são retornadas sem modificação.

#### `theme-applicator.ts`

Função: `themeApplicator()` retorna `{ apply, canvasColor }`.

Aplica uma `ExcalidrawThemePalette` aos skeletons, remapeando `strokeColor` e `backgroundColor` por tipo e `fillStyle`. Skips: `frame`, `image`, `magicframe`.

> **Status: não conectado ao pipeline** — será adicionado ao `slideStructureTool` no Ciclo 4 (feature Themes). Requer que `theme` da Presentation seja resolvido para `ExcalidrawThemePalette` antes da chamada.

---

### math/ — `element-sizing.ts`

Função: `elementSizing()` retorna `{ calcTextWidth, calcContainerHeight, snapToGrid }`.

| Método | Descrição |
|--------|-----------|
| `calcTextWidth(text, language)` | Largura estimada em px; +15% para pt/ptBR/es/fr/de/it |
| `calcContainerHeight(lines, fontSize, padding)` | Altura = `lines × fontSize × 1.5 + padding × 2` |
| `snapToGrid(value, gridSize=20)` | Arredonda para múltiplo de `gridSize` |

> **Status: não conectado** — destinado à injeção de valores de referência no prompt do `slideCreatorAgent` (pendência P3 no backlog).

---

### themes/ — `presentation-themes.ts`

Função: `presentationThemes()` retorna `{ themes, getByKey, buildPalettePrompt }`.

Define os 10 temas do produto com `ExcalidrawThemePalette` (canvas, stroke, text, primary, secondary, accent) e metadados (name, description, mode, font).

| Método | Uso |
|--------|-----|
| `.getByKey(key)` | Retorna `ExcalidrawThemeMeta`; fallback: `daktilo` |
| `.buildPalettePrompt(key)` | Gera tabela markdown da paleta — injetada nas instructions do `slideCreatorAgent` via `buildSlideCreatorPrompt` |

> `themeApplicator` importa `ExcalidrawThemePalette` deste módulo.

---

### serialize/ — `skeleton-serializer.ts`

Função: `skeletonSerializer()` retorna `{ serialize }`.

Converte `ExcalidrawElementSkeleton[]` em documento Excalidraw completo (`type`, `version`, `source`, `elements`, `appState`, `files`) via `convertToExcalidrawElements`.

> **Client-side only.** Deve ser importado apenas em componentes com `dynamic(..., { ssr: false })`.  
> **Status: não conectado** — será usado pelo editor (`/presentations/[id]/editor`) para carregar slides no canvas.

---

### generators/ — `element-generators.ts`

Função: `elementsGenerator()` retorna `{ arrow, rectangle, ellipse, diamond, text, line, frame }`.

Helpers tipados para criação programática de skeletons com defaults aplicados. Usados no sandbox de desenvolvimento (`/dev/sandbox`) — **não fazem parte do pipeline AI**.

> `representation-generators.ts` — arquivo vazio, não implementado.

---

## Pontos de atenção

- `.validate()` é o caminho principal (tool call); `.parse()` é fallback para texto livre
- A ordem de normalização importa: `repair` antes de `order`, `order` antes de `normalize`
- `binding-repairer` é zero-copy quando não há patches — sem overhead em skeletons já corretos
- `theme-applicator` e `skeleton-serializer` existem e têm testes mas aguardam integração (Ciclo 4 e editor)
- `element-sizing` aguarda integração no prompt (P3 backlog)

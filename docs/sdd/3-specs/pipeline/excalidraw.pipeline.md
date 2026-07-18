# Pipeline: Excalidraw

## Visão geral

A `lib/excalidraw` cobre o ciclo completo de vida de um skeleton dentro do projeto: **parse → normalize → serialize**, com módulos auxiliares de **math**, **themes** e **generators**. `lib/excalidraw/index.ts` (`excalidrawSkeleton()`) é o ponto único de entrada pra tudo isso — mesma convenção de actions/store/hooks (uma factory, um objeto de capacidades relacionadas).

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

## Ponto de entrada — `lib/excalidraw/index.ts`

`excalidrawSkeleton()` retorna:

| Campo | O que é | Modo de uso |
|-------|---------|-------------|
| `.parse`, `.validate` | `elementParser()` | ação granular |
| `.normalize` | `normalizeSkeletons` (skeleton-pipeline.ts) | ação granular |
| `.size` | `elementSizing()` | ação granular |
| `.theme` | `presentationThemes()` | ação granular |
| `.generate` | `elementsGenerator()` | ação granular |
| `.fromAiOutput(raw, context?)` | atalho: `validate` → `normalize` num só passo | "resolve tudo" |

`serialize/` (`skeletonSerializer`) fica **de fora** desse barrel de propósito: `convertToExcalidrawElements` toca `window` na avaliação do módulo — importar estaticamente aqui quebraria qualquer consumidor server-side (`slide-workflow.ts`, `slide-structure-tool.ts`). Continua exigindo import dinâmico client-only (ver `use-app-studio-hydration.ts`).

Consumidores atuais: `slide-structure-tool.ts` usa `.fromAiOutput(elements)` (sem context — a tool não tem acesso à Presentation); `slide-workflow.ts` usa `.parse`, `.theme.getByKey`/`.getSemanticRoles` e `.fromAiOutput(elements, enrichmentContext)` no fechamento do step, com o contexto completo já resolvido.

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

### normalize/ — 6 módulos em dois estágios

Orquestrados por `normalizeSkeletons()` (`skeleton-pipeline.ts`):

```
validate (parser)
  │
  ├─ Estágio 1 — segurança geométrica (sempre, mesmo sem context)
  │    → repair    (binding-repairer)
  │    → order     (element-orderer)
  │    → normalize (arrows-normalizer)
  │
  └─ Estágio 2 — enriquecimento (só com `context` resolvido)
       → theme     (theme-applicator — cor por role/fillStyle)
       → wrap      (text-wrapper — quebra texto livre)
       → snap      (grid-snapper — múltiplos de 20px)
```

Chamado em **dois** pontos:
1. `slide-structure-tool.ts` — caminho principal (tool call), **sem** context (a tool não conhece tema/idioma/canvas da Presentation) → só Estágio 1
2. `slide-workflow.ts`, no fechamento do step, **com** context completo → Estágio 1 + 2, sobre o resultado final (tool ou fallback de texto livre). Reexecutar o Estágio 1 sobre o caminho da tool é redundante mas idempotente; é o único jeito de garantir que o fallback de texto livre (que nunca passa pela tool) também seja normalizado.

#### `binding-repairer.ts`

Função: `bindingRepairer()` retorna `{ repair }`.

Sincroniza bidireccionalmente dois pares de relacionamento que a IA frequentemente emite só numa direção: `containerId` ↔ `boundElements` (texto/container) e `frameId` ↔ `children` (elemento/frame).

```
Pass 1: texto com containerId → garante que container tem boundElements[{ type:"text", id }]
Pass 2: container com boundElements → garante que cada texto tem containerId correto
Pass 3: elemento com frameId → garante que o frame tem esse id em children
Pass 4: frame com children → garante que cada filho referenciado tem frameId de volta
Pass 5: frame que continua sem children depois disso (nenhum filho referenciando) → children: []
```

Retorna skeletons inalterados se não há patches necessários (zero-copy).

**Bug real (produção, 2026-07-19):** um slide de arquitetura (frames "Camada de Apresentação/Negócio/Dados") tinha os elementos filhos com `frameId` apontando certinho pro frame, mas os 3 frames sem `children` nenhum — `convertToExcalidrawElements` espera `children` como array e quebra (`Cannot read properties of undefined (reading 'forEach')`) ao processar um frame sem essa chave, travando a hidratação inteira do Studio pra essa presentation. Pass 3/5 cobrem esse caso.

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
Para cada arrow/line:
  - start.id e end.id resolvem os dois → determineEdges(startRect, endRect)
    → getEdgeCenter em cada ponta → width/height a partir dos dois pontos
    (fix: width === 0 → força 1, bug de render do Excalidraw)
  - só um lado resolve (a IA emitiu só start ou só end, ou o id referenciado
    não existe no slide) → ancora no lado que resolveu, usa comprimento
    padrão (150px) na direção esquerda→direita
  - nenhum lado resolve e não há binding → mantém geometria explícita se
    houver, senão aplica fallback fixo (x:0, y:0, width:150, height:0)
```

**Nunca** devolve uma seta com `x`/`y`/`width`/`height` não-finitos — encontrado em produção (2026-07-18): a IA gerou uma seta com `start.id` mas sem `end`, que antes desse fix passava intocada e virava `NaN` na hora de renderizar (SVG preview e editor). Ver ADR-014.

#### `theme-applicator.ts`

Função: `themeApplicator()` retorna `{ apply, canvasColor }`.

`apply(skeletons, palette, semanticRoles?)` — resolve cor em duas camadas, a segunda opcional e aditiva (nunca quebra o comportamento sem ela):

1. **fillStyle → hierarquia** (sempre): `solid`→`palette.primary`, `cross-hatch`→`palette.accent`, outros→`palette.secondary`. Texto sempre usa `palette.text`.
2. **role → papel semântico** (só quando `semanticRoles` é passado e o elemento tem `raw.role` reconhecido): sobrescreve `strokeColor`/`backgroundColor` com o par do papel (`success`/`warning`/`danger`/`external`/`process`/`trigger`/`neutral`), tem prioridade sobre a hierarquia de fillStyle. Não se aplica a `text` (cor de texto nunca varia por role — ver `themes/`).

Skips: `frame`, `image`, `magicframe`.

> **Status: conectado** (Estágio 2 do `normalizeSkeletons`, via `slide-workflow.ts`).

#### `text-wrapper.ts`

Função: `textWrapper()` retorna `{ wrap }`.

`wrap(skeletons, { canvasWidth, language })` — quebra automaticamente texto livre (`type: "text"` sem `containerId`) que não caberia na largura disponível, usando `elementSizing().calcTextWidth` (heurística por contagem de caracteres — não há canvas real disponível server-side pra medir de verdade). Texto vinculado a container (`containerId` presente) é ignorado — o próprio Excalidraw já resolve isso no client via `redrawTextBoundingBox` (ver `math/` abaixo).

> **Status: conectado** (Estágio 2 do `normalizeSkeletons`).

#### `grid-snapper.ts`

Função: `gridSnapper()` retorna `{ snap }`.

`snap(skeletons, gridSize=20)` — arredonda `x`/`y` de todo elemento e `width`/`height` de shapes (não de `arrow`/`line` — snapping arredondaria o `width:1` do fix de `arrows-normalizer` de volta pra `0`, desfazendo-o). Zero-copy quando o valor já está alinhado.

> **Status: conectado** (Estágio 2 do `normalizeSkeletons`).

---

### math/ — `element-sizing.ts`

Função: `elementSizing()` retorna `{ calcTextWidth, calcContainerHeight, snapToGrid }`.

| Método | Descrição | Usado por |
|--------|-----------|-----------|
| `calcTextWidth(text, language)` | Largura estimada em px; +15% para pt/ptBR/es/fr/de/it | `text-wrapper.ts` |
| `snapToGrid(value, gridSize=20)` | Arredonda para múltiplo de `gridSize` | `grid-snapper.ts` |
| `calcContainerHeight(lines, fontSize, padding)` | Altura = `lines × fontSize × 1.5 + padding × 2` | **não usado** — ver nota abaixo |

> **`calcContainerHeight` não tem consumidor.** Investigando o fluxo de container-com-label (`rectangle`/`ellipse`/`diamond` + `label.text`), o próprio `convertToExcalidrawElements` do Excalidraw (`bindTextToContainer` → `redrawTextBoundingBox`) já **expande o container automaticamente** quando o texto medido (via canvas real, client-side) excede o `width`/`height` fornecido — inclusive quando ambos são omitidos (viram `0` pro tipo com label, ver código-fonte do pacote). Ou seja: dar uma estimativa aproximada de tamanho (bom o suficiente pra posicionamento/centralização) já é seguro — o Excalidraw corrige subestimativas com medição real, melhor que qualquer heurística nossa. Por isso o prompt (`slide-creator-prompt.ts`) pede só uma estimativa razoável, não mais uma fórmula exata — `calcContainerHeight` ficou sem uso nesse desenho. Mantido (não é dead code no sentido de "esquecido" — é uma decisão consciente registrada aqui e no ADR-014) caso surja um cenário sem esse auto-grow (ex: pré-visualização server-side sem passar pelo client).

---

### themes/ — `presentation-themes.ts`

Função: `presentationThemes()` retorna `{ themes, getByKey, getSemanticRoles, buildSemanticRolesPrompt }`.

Define os 10 temas do produto com `ExcalidrawThemePalette` (canvas, stroke, text, primary, secondary, accent) e metadados (name, description, mode, font) — decorativo, varia por tema.

Além disso, define **papéis semânticos** (`SemanticRole`: success/warning/danger/external/process/trigger/neutral), compartilhados por **modo** (light/dark), não por tema — verde=sucesso deve significar a mesma coisa em qualquer tema decorativo, só ajustado de contraste pro canvas claro/escuro.

| Método | Uso |
|--------|-----|
| `.getByKey(key)` | Retorna `ExcalidrawThemeMeta`; fallback: `daktilo` |
| `.getSemanticRoles(key)` | Retorna o par fill/stroke dos 7 papéis pro modo (light/dark) do tema `key` |
| `.buildSemanticRolesPrompt()` | Tabela markdown nomeando os papéis (sem hex) — injetada no prompt do `slideCreatorAgent` |

> `theme-applicator.ts` importa `ExcalidrawThemePalette`/`SemanticPair`/`SemanticRole` deste módulo.

**Removido:** `buildPalettePrompt(key)` (injetava a paleta hex do tema direto no prompt). A resolução de cor por tema agora acontece só em código (`theme-applicator.ts`), depois da geração — o prompt não precisa mais saber hex nenhum, só o nome do `role`. Isso também corrigia uma inconsistência real: os exemplos JSON embutidos no prompt usavam hex fixos que ignoravam o tema selecionado (ver ADR-014).

---

### serialize/ — `skeleton-serializer.ts`

Função: `skeletonSerializer()` retorna `{ serialize }`.

Converte `ExcalidrawElementSkeleton[]` em documento Excalidraw completo (`type`, `version`, `source`, `elements`, `appState`, `files`) via `convertToExcalidrawElements`.

> **Client-side only.** Deve ser importado apenas em componentes com `dynamic(..., { ssr: false })` ou `import()` adiado. **Não é exportado por `lib/excalidraw/index.ts`** — importar estaticamente ali quebraria SSR pra qualquer consumidor do barrel (ver seção "Ponto de entrada" acima).
> **Status: conectado** — usado em `use-app-studio-hydration.ts` (import adiado em `useEffect`) pra converter os skeletons de cada slide em `scene.elements` ao hidratar o Studio.

---

### generators/ — `element-generators.ts`

Função: `elementsGenerator()` retorna `{ arrow, rectangle, ellipse, diamond, text, line, frame }`.

Helpers tipados para criação programática de skeletons com defaults aplicados. Usados no sandbox de desenvolvimento (`/dev/sandbox`) — **não fazem parte do pipeline AI**.

> `representation-generators.ts` — arquivo vazio, não implementado.

---

## Pontos de atenção

- `.validate()` é o caminho principal (tool call); `.parse()` é fallback para texto livre — mas **ambos** passam por `fromAiOutput`/`normalizeSkeletons` antes de virar `SlideWorkflowOutput` (ver `slide-workflow.ts`), não só o caminho da tool
- Dentro de `normalizeSkeletons`, a ordem do Estágio 1 importa (`repair` → `order` → `arrows`); o Estágio 2 (`theme` → `wrap` → `snap`) só roda com `context`
- `binding-repairer` é zero-copy quando não há patches — sem overhead em skeletons já corretos
- `role` (papel semântico) tem prioridade sobre `fillStyle` pra cor, mas os dois compõem — `fillStyle` continua controlando peso/textura
- `calcContainerHeight` não tem consumidor — decisão consciente, não esquecimento (ver `math/` acima e ADR-014)
- `skeleton-serializer` está conectado (Studio), mas deliberadamente fora de `lib/excalidraw/index.ts` (client-only)
- `elementsGenerator`/`representation-generators.ts` (vazio) são pro sandbox de dev, não pro pipeline de IA — fora de escopo de qualquer normalização

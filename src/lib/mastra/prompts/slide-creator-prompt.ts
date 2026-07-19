import { presentationThemes } from "@/lib/excalidraw/themes/presentation-themes"
import { AMOUNT_RANGE, AUDIENCE_HINTS, SCENARIO_HINTS } from "@/schemas/app/presentation-schema"

// ─── Placeholder replacement ────────────────────────────────────────────────

function fill(text: string, canvas: { width: number; height: number; label: string }): string {
  const xMax    = canvas.width - 20
  const yMax    = canvas.height - 20
  const centerX = Math.round(canvas.width / 2)
  const centerY = Math.round(canvas.height / 2)
  return text
    .replace(/\{\{WIDTH\}\}/g,    canvas.width.toString())
    .replace(/\{\{HEIGHT\}\}/g,   canvas.height.toString())
    .replace(/\{\{RATIO\}\}/g,    canvas.label)
    .replace(/\{\{XMAX\}\}/g,     xMax.toString())
    .replace(/\{\{YMAX\}\}/g,     yMax.toString())
    .replace(/\{\{CENTER_X\}\}/g, centerX.toString())
    .replace(/\{\{CENTER_Y\}\}/g, centerY.toString())
}

// ─── Core invariant ─────────────────────────────────────────────────────────

const CORE = `
## Tarefa

Com base no outline do slide, gere um slide Excalidraw que **argumenta visualmente** — a estrutura dos elementos deve comunicar o conceito por si só. Utilize Binding, Containment, Grouping e Framing de forma racional.

## Saída

Chame \`slideStructureTool\` passando o array de ExcalidrawElementSkeleton. Nenhum outro conteúdo.

## Canvas

- Largura: {{WIDTH}}px, Altura: {{HEIGHT}}px (proporção {{RATIO}})
- Retângulo \`slide-boundary\` já existe — não o inclua
- Margem mínima 20px — área útil: x 20–{{XMAX}}, y 20–{{YMAX}}
- Todo elemento: \`x + width ≤ {{XMAX}}\` e \`y + height ≤ {{YMAX}}\`
- Planeje coordenadas antes de gerar: sem sobreposições, mínimo 40px entre elementos

## Análise do Outline

1. Leia tipo, título, descrição, conceitos e representação visual
2. Use texto livre (\`type: text\`) para títulos, labels e anotações — máximo 30% dos textos dentro de formas

## Regras Críticas

1. **strokeColor em text** = cor do texto — sempre defina, nunca omita
2. **Setas vinculadas por id**: x/y/width/height calculados automaticamente — não force valores; **nunca use só um dos dois** (\`start\` sem \`end\`, ou vice-versa)
3. **IDs descritivos**: "cover_title", "step_inicio", "arrow_a_b" — nunca "r1", "t2"
4. **Sem texto vinculado em zones grandes** — use texto livre posicionado no topo
5. **Centralização**: container de largura W → x = ({{WIDTH}} − W) / 2; text com textAlign:center → x = {{CENTER_X}}
6. **Texto livre muito longo é quebrado automaticamente** — mas prefira \\n deliberado pra títulos/subtítulos curtos e legíveis
7. **Sem markdown**: nunca use \`**negrito**\`, \`*itálico*\`, \`# heading\` — Excalidraw renderiza literalmente
8. **Cor por papel**: defina \`role\` (ver Papéis Semânticos) em vez de hex — a cor real vem do tema da apresentação. Hierarquia de texto (título/label/anotação) é por \`fontSize\`/\`opacity\`, não por cor — todo texto usa a mesma cor do tema

## Anti-Patterns

- ❌ Grade uniforme de caixas iguais com labels — use formas que espelham o conceito
- ❌ Container com \`width\`/\`height\` arbitrários que ignoram a hierarquia visual (o Excalidraw expande se o texto não couber, mas isso é uma rede de segurança — não substitui bom senso de tamanho)
- ❌ Seta com label de >12 caracteres em espaço <120px
- ❌ Elementos sobrepostos — mínimo 40px entre qualquer par
`.trim()

// ─── Element API (composable) ───────────────────────────────────────────────

const ELEM_SHAPES = `
### Retângulo / Elipse / Losango (rectangle / ellipse / diamond)
- **Obrigatório**: \`type\`, \`id\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\`, \`strokeWidth\`, \`strokeStyle\` (solid|dashed|dotted), \`fillStyle\` (solid|hachure|zigzag|cross-hatch), \`roughness\`, \`opacity\`, \`angle\`, \`roundness\`, \`locked\`
- **Cor por papel**: defina \`role\` (ver Papéis Semânticos) em vez de \`strokeColor\`/\`backgroundColor\` — a cor real vem do tema da apresentação
- **Container com label**: forneça \`label.text\` com \`width\`/\`height\` — só uma estimativa razoável (ver Dimensões de Referência), não precisa calcular caracteres/linhas: o Excalidraw expande o container automaticamente se o texto não couber
  - Opcionais do label: \`fontSize\`, \`fontFamily\`, \`textAlign\`, \`verticalAlign\`
`.trim()

const ELEM_TEXT = `
### Texto livre (text)
- **Obrigatório**: \`type\`, \`id\`, \`x\`, \`y\`, \`text\`
- \`width\`/\`height\` calculados automaticamente — não forneça
- Texto muito longo pra caber na largura disponível é quebrado automaticamente — não precisa calcular caracteres por linha
- **strokeColor** = cor do texto — sempre defina (todo texto usa a mesma cor do tema; hierarquia é por \`fontSize\`/\`opacity\`, não cor)
- **textAlign:center**: \`x\` é o centro horizontal — use x = {{CENTER_X}} para centralizar no canvas
- **Opcional**: \`fontSize\`, \`fontFamily\` (1|2|3), \`strokeColor\`, \`opacity\`, \`angle\`, \`textAlign\`, \`verticalAlign\`
`.trim()

const ELEM_LINE = `
### Linha estrutural (line)
- **Obrigatório**: \`type\`, \`id\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\` (padrão 100×0), \`strokeWidth\`, \`strokeStyle\`
- Uso: timelines, divisores, árvores — sem vinculação start/end
`.trim()

const ELEM_ARROW = `
### Seta (arrow)
- **Obrigatório**: \`type\`, \`id\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\`, \`strokeWidth\`, \`strokeStyle\`, \`elbowed\`
- **Cor por papel**: \`role\` também vale pra seta (ex: \`role: "danger"\` numa dependência crítica) — sem role, usa a cor padrão de stroke do tema
- **Cabeças**: \`startArrowhead\`/\`endArrowhead\` — valores: arrow, bar, circle, circle_outline, triangle, triangle_outline, diamond, diamond_outline
- **Vinculação** via \`start\`/\`end\`:
  - Por tipo: \`{ "type": "rectangle" }\` — cria automaticamente
  - Por id: \`{ "id": "step_inicio" }\` — vincula a elemento existente
  - x/y/width/height inferidos automaticamente quando vinculada
  - **Nunca use só um dos dois** — \`start\` sem \`end\` (ou vice-versa) não tem como ser posicionado
- \`"elbowed": true\` para ângulos retos automáticos
- \`label.text\` adiciona texto na seta (máx. 12 caracteres)
- **Proibido**: não passe \`points\`
- Setas não vinculadas: garanta \`x + width ≤ {{XMAX}}\` e \`y + height ≤ {{YMAX}}\`

| strokeStyle | Significado |
|-------------|-------------|
| solid (padrão) | fluxo principal, caminho direto |
| dashed | resposta, async, callback |
| dotted | opcional, referência, dependência fraca |
`.trim()

const ELEM_FRAME = `
### Frame (frame)
- **Obrigatório**: \`type\`, \`id\`, \`children\` (array de IDs)
- **Opcional**: \`x\`, \`y\`, \`width\`, \`height\`, \`name\`
- Coordenadas calculadas pelos children com margem de 10px
`.trim()

const ELEM_COMMON = `
### Propriedades comuns
- **Agrupamento**: \`groupIds\` (array de strings compartilhados entre elementos do mesmo grupo)
`.trim()

// ─── Shared reference tables ────────────────────────────────────────────────

const SHAPES_MEANING = `
## Significado das Formas

| Conceito | Forma |
|----------|-------|
| Título, label, anotação | texto livre |
| Início, trigger, input | ellipse |
| Fim, output, resultado | ellipse |
| Decisão, condição | diamond |
| Processo, etapa, ação | rectangle |
| Marcador de timeline | ellipse 12×12px |
| Hierarquia, árvore | linhas + texto livre |
`.trim()

const FILLSTYLE_TABLE = `
## Hierarquia de fillStyle

| Hierarquia | fillStyle | Uso |
|------------|-----------|-----|
| Elemento principal | \`solid\` | foco visual, nó central, etapa primária |
| Elemento secundário | \`hachure\` | suporte, contexto, sub-etapa |
| Container / zona | \`cross-hatch\` | delimitação sem peso visual |
| Placeholder / inativo | (transparent) | referência, estado futuro |

\`fillStyle\` controla peso/textura do preenchimento. \`role\` (ver Papéis Semânticos), quando definido, tem prioridade sobre essa hierarquia pra decidir a cor em si — os dois combinam: \`role: "trigger"\` com \`fillStyle: "solid"\` é um gatilho em destaque forte.
`.trim()

const REFERENCE_TABLES = `
## Dimensões de Referência

| Hierarquia | width | height |
|------------|-------|--------|
| Primário (etapa principal, nó central) | 120–160 | 60 |
| Secundário (sub-etapa, nó filho) | 80–100 | 40 |
| Ícone / Marcador (dot, indicador) | 24 | 24 |

## Espaçamento

| Cenário | Espaço |
|---------|--------|
| Entre shapes com seta com label | 150–200px |
| Entre shapes com seta sem label | 100–120px |
| Padding interno de container/zone | 50–60px |
| Mínimo entre qualquer par | 40px |

## Hierarquia Tipográfica

| Nível | fontSize |
|-------|----------|
| Título do slide | 28–36px |
| Header de seção | 20–24px |
| Label de elemento | 16–18px |
| Anotação | 13–14px |
`.trim()

// ─── Representation → extra elements ───────────────────────────────────────

type ExtraElement = "line" | "arrow" | "frame"

const REPRESENTATION_EXTRAS: Record<string, ExtraElement[]> = {
  flowchart:    ["arrow"],
  mindmap:      ["arrow", "frame"],
  orgchart:     ["arrow"],
  tree:         ["line", "arrow"],
  sequence:     ["line", "arrow"],
  timeline:     ["line"],
  network:      ["arrow"],
  architecture: ["arrow", "frame"],
  dataflow:     ["arrow"],
  state:        ["arrow"],
  pyramid:      [],
  venn:         [],
  matrix:       ["arrow", "frame"],
  swimlane:     ["arrow", "frame"],
  class:        ["arrow", "frame"],
  er:           ["arrow"],
  gantt:        ["line"],
  fishbone:     ["line"],
  funnel:       [],
  infographic:  ["frame"],
}

// ─── Slide type guides ──────────────────────────────────────────────────────

const SLIDE_TYPE_GUIDES: Record<string, string> = {
  cover: `
## Guia: cover

- Título e subtítulo centrados verticalmente em y≈{{CENTER_Y}}
- Título: text, fontSize 36–44, textAlign center, x={{CENTER_X}}, y={{CENTER_Y}}−60
- Subtítulo: text, fontSize 18–22, textAlign center, x={{CENTER_X}}, y={{CENTER_Y}}+20, opacity 80 (mais discreto que o título)
- Decoração fora da faixa y=({{CENTER_Y}}−80)–({{CENTER_Y}}+80) — sem setas, sem sobreposição
- Máximo 5 elementos

\`\`\`json
[
  { "type": "text", "id": "cover_title",    "x": {{CENTER_X}}, "y": {{CENTER_Y}}, "text": "Título", "fontSize": 36, "textAlign": "center" },
  { "type": "text", "id": "cover_subtitle", "x": {{CENTER_X}}, "y": {{CENTER_Y}}+60, "text": "Subtítulo", "fontSize": 20, "textAlign": "center", "opacity": 80 }
]
\`\`\`
`.trim(),

  content: `
## Guia: content

- Título no topo: text livre, fontSize 22–26, y=25
- Conteúdo principal: y=70 a y={{YMAX}}−20
- Use a representação visual indicada
- Hierarquia visual: elemento principal maior, secundários menores
`.trim(),

  closing: `
## Guia: closing

- Mensagem de impacto centralizada: text livre, fontSize 32–42, y≈170
- Call to action abaixo: fontSize 18, opacity 80, y≈240
- Elementos decorativos simples de reforço visual
`.trim(),
}

// ─── Representation guides (com exemplos embutidos) ─────────────────────────

const REPRESENTATION_GUIDES: Record<string, string> = {
  flowchart: `
## Guia: flowchart

- Ellipse para início/fim, rectangle para etapas, diamond para decisões
- Setas — use \`elbowed: true\` para fluxos ortogonais
- Fluxo esquerda→direita ou cima→baixo
- Espaçamento: 150px entre shapes com labels, 100px sem

\`\`\`json
[
  { "type": "ellipse",   "id": "start",   "x": 60,  "y": 180, "width": 120, "height": 60, "label": { "text": "Início" }, "role": "trigger" },
  { "type": "rectangle", "id": "step_a",  "x": 260, "y": 180, "width": 160, "height": 60, "label": { "text": "Processo" }, "role": "process" },
  { "type": "diamond",   "id": "dec_a",   "x": 500, "y": 160, "width": 140, "height": 100, "label": { "text": "OK?" }, "role": "warning" },
  { "type": "arrow", "x": 0, "y": 0, "start": { "id": "start"  }, "end": { "id": "step_a" }, "elbowed": true },
  { "type": "arrow", "x": 0, "y": 0, "start": { "id": "step_a" }, "end": { "id": "dec_a"  }, "elbowed": true }
]
\`\`\`
`.trim(),

  mindmap: `
## Guia: mindmap

- Nó central: rectangle 200×70 com \`role: "process"\` em ~({{CENTER_X}}−100, {{CENTER_Y}}−35)
- Nós filhos: ellipses ou rectangles menores ao redor, conectados por setas ao centro
- Distribuição radial: 2–3 nós por quadrante
- \`role\` diferente por branch (ex: trigger, success, external) pra distinguir ramos
`.trim(),

  orgchart: `
## Guia: orgchart

- Nó raiz no topo (rectangle, \`role: "process"\`)
- Filhos abaixo conectados por setas verticais
- Mesmo nível: espaçamento horizontal ~180px entre centros
- groupIds para agrupar nós do mesmo nível
`.trim(),

  tree: `
## Guia: tree

- Nó raiz no topo, filhos abaixo
- Use linhas (type: line) como estrutura + texto livre como labels — sem caixas
- Linha vertical principal descendo do raiz, linhas horizontais para cada filho
`.trim(),

  sequence: `
## Guia: sequence

- Participantes: rectangles no topo (y=40), espaçados 200px horizontalmente
- Linhas de vida: linhas verticais pontilhadas descendo de cada participante
- Mensagens: setas horizontais entre linhas de vida, 60px de espaçamento vertical
- solid = request, dashed = response

\`\`\`json
[
  { "type": "rectangle", "id": "p1", "x": 60,  "y": 40, "width": 120, "height": 40, "label": { "text": "Cliente" }, "role": "process" },
  { "type": "rectangle", "id": "p2", "x": 320, "y": 40, "width": 120, "height": 40, "label": { "text": "Servidor" }, "role": "process" },
  { "type": "line",  "id": "lifeline_1", "x": 120, "y": 80,  "width": 0,   "height": 280, "strokeStyle": "dotted" },
  { "type": "line",  "id": "lifeline_2", "x": 380, "y": 80,  "width": 0,   "height": 280, "strokeStyle": "dotted" },
  { "type": "arrow", "id": "msg_1", "x": 120, "y": 140, "width": 200, "height": 0,   "label": { "text": "POST /data" } },
  { "type": "arrow", "id": "msg_2", "x": 380, "y": 200, "width": -200,"height": 0,   "strokeStyle": "dashed", "label": { "text": "200 OK" } }
]
\`\`\`
`.trim(),

  timeline: `
## Guia: timeline

- Eixo: line horizontal y={{CENTER_Y}}, x de 60 a {{XMAX}}−60, strokeWidth 2
- Marcadores: ellipses 12×12px sobre o eixo, \`role: "process"\`
- Labels abaixo: text fontSize 13, opacity 80
- Eventos acima: text fontSize 15
- Distribuição uniforme dos marcadores

\`\`\`json
[
  { "type": "line",    "id": "axis",  "x": 60,  "y": 220, "width": 680, "height": 0,  "strokeWidth": 2 },
  { "type": "ellipse", "id": "dot_1", "x": 154, "y": 214, "width": 12,  "height": 12, "role": "process" },
  { "type": "text", "id": "label_1", "x": 130, "y": 240, "text": "Jan 2024", "fontSize": 13, "opacity": 80 },
  { "type": "text", "id": "event_1", "x": 120, "y": 190, "text": "Evento A", "fontSize": 15 }
]
\`\`\`
`.trim(),

  network: `
## Guia: network

- Nó central: shape maior em (~{{CENTER_X}}, {{CENTER_Y}})
- Nós periféricos: shapes menores ao redor
- Conexões: setas bidirecionais (startArrowhead: "arrow", endArrowhead: "arrow")
- \`role\` diferente por tipo de nó distinto
- Toda seta precisa de \`start\` **e** \`end\` — nunca só um dos dois

\`\`\`json
[
  { "type": "ellipse",   "id": "node_core", "x": 340, "y": 175, "width": 120, "height": 100, "label": { "text": "Core" },   "role": "process" },
  { "type": "rectangle", "id": "node_a",    "x": 80,  "y": 60,  "width": 100, "height": 60,  "label": { "text": "Node A" }, "role": "external" },
  { "type": "rectangle", "id": "node_b",    "x": 80,  "y": 300, "width": 100, "height": 60,  "label": { "text": "Node B" }, "role": "external" },
  { "type": "rectangle", "id": "node_c",    "x": 600, "y": 180, "width": 100, "height": 60,  "label": { "text": "Node C" }, "role": "external" },
  { "type": "arrow", "x": 0, "y": 0, "start": { "id": "node_core" }, "end": { "id": "node_a" }, "startArrowhead": "arrow", "endArrowhead": "arrow" },
  { "type": "arrow", "x": 0, "y": 0, "start": { "id": "node_core" }, "end": { "id": "node_b" }, "startArrowhead": "arrow", "endArrowhead": "arrow" },
  { "type": "arrow", "x": 0, "y": 0, "start": { "id": "node_core" }, "end": { "id": "node_c" }, "startArrowhead": "arrow", "endArrowhead": "arrow" }
]
\`\`\`
`.trim(),

  architecture: `
## Guia: architecture

- Camadas horizontais de cima para baixo (Apresentação → Negócio → Dados)
- Cada camada: rectangle de zona (fillStyle: cross-hatch, \`role: "neutral"\`) com label texto livre no topo-esquerdo
- Componentes internos: rectangles menores com label e \`role\` (ex: "process", "external")
- Setas entre camadas representam dependências

\`\`\`json
[
  { "type": "rectangle", "id": "layer_api", "x": 40, "y": 60, "width": 720, "height": 120, "fillStyle": "cross-hatch", "role": "neutral" },
  { "type": "text", "id": "layer_api_label", "x": 60, "y": 70, "text": "API Layer", "fontSize": 14 },
  { "type": "rectangle", "id": "svc_auth", "x": 80, "y": 100, "width": 140, "height": 60, "label": { "text": "Auth" }, "role": "process" },
  { "type": "frame", "id": "frame_apresentacao", "children": ["layer_api", "svc_auth"], "name": "Apresentação" }
]
\`\`\`
`.trim(),

  dataflow: `
## Guia: dataflow

- Entidades externas: rectangles nas bordas (\`role: "external"\`)
- Processos: ellipses no centro (\`role: "process"\`)
- Armazenamentos: rectangles (\`role: "success"\`)
- Setas direcionadas com label indicando o dado que flui
`.trim(),

  state: `
## Guia: state

- Estados: rectangles com roundness (\`role: "process"\`)
- Estado inicial: ellipse pequena sólida 12×12px (\`role: "trigger"\`)
- Estado final: ellipse (\`role: "success"\`)
- Transições: setas com label indicando evento/condição
`.trim(),

  pyramid: `
## Guia: pyramid

- 3–5 rectangles empilhados verticalmente, centralizados em x={{CENTER_X}}
- Largura decrescente de baixo para cima: base ~600px, topo ~120px
- \`role: "process"\` (topo) a \`role: "neutral"\` (base)
`.trim(),

  venn: `
## Guia: venn

- 2–3 ellipses sobrepostas com sobreposição de ~30% do raio
- Cada ellipse com \`role\` distinto (opacity 70)
- Labels de texto livre identificando cada conjunto e a interseção
`.trim(),

  matrix: `
## Guia: matrix

- Headers de linha (topo) e coluna (esquerda): rectangles \`role: "neutral"\`
- Células: rectangles com label, \`role\` baseado no valor semântico (ex: "success"/"warning"/"danger")
- Grid com espaçamento consistente entre linhas e colunas
`.trim(),

  swimlane: `
## Guia: swimlane

- Raias: rectangles grandes (fillStyle: hachure, \`role: "neutral"\`) como faixas horizontais ou verticais
- Label de raia: texto livre no topo-esquerdo (fontSize 16) — não vincule ao container
- Setas cruzam raias nos handoffs
`.trim(),

  class: `
## Guia: class (UML)

- Classe: rectangle com label (nome da classe)
- Herança: seta com endArrowhead "triangle_outline" do filho para o pai
- Associação: seta simples com label de cardinalidade
- Classes pai no topo, filhas abaixo
`.trim(),

  er: `
## Guia: er (Entidade-Relacionamento)

- Entidades: rectangles (\`role: "process"\`) com nome centralizado
- Relacionamentos: diamonds entre entidades
- Cardinalidade: label na seta (1, N, M)
- Setas: entidade → relacionamento → entidade
`.trim(),

  gantt: `
## Guia: gantt

- Header de tempo: rectangles de período no topo (y=40, \`role: "neutral"\`)
- Tarefas: texto livre à esquerda (x=20)
- Barras: rectangles horizontais alinhados ao período
- \`role\`: success (concluído), process (em andamento), neutral (não iniciado)
`.trim(),

  fishbone: `
## Guia: fishbone (Ishikawa)

- Espinha central: line strokeWidth 3 de x=60 a x={{XMAX}}−60, y={{CENTER_Y}}
- Problema/efeito: rectangle à direita (\`role: "danger"\`) com label
- Categorias: setas diagonais a 45° conectando à espinha, alternadas acima e abaixo
- Causas: texto livre nas pontas (fontSize 13)
`.trim(),

  funnel: `
## Guia: funnel

- 4–6 rectangles empilhados verticalmente, centralizados em x={{CENTER_X}}
- Largura decrescente de cima para baixo: topo ~680px, base ~140px
- Label: texto livre com nome do estágio e percentual/valor ao lado
- \`role: "trigger"\` (topo) a \`role: "success"\` (base)
`.trim(),

  infographic: `
## Guia: infographic

- Use frames para módulos de informação independentes
- Números em destaque: fontSize 36–48, texto livre + label menor abaixo
- Containers apenas onde necessário — prefira hierarquia tipográfica
- 3–4 \`role\` diferentes pra distinguir módulos
`.trim(),
}

// ─── Types and builder ──────────────────────────────────────────────────────

export type SlideCreatorContext = {
  amount:   number
  audience: number
  scenario: number
  theme:    number
}

export function buildSlideCreatorPrompt(
  type: string,
  representation: string,
  canvas: { width: number; height: number; label: string },
  context?: SlideCreatorContext,
): string {
  const f      = (s: string) => fill(s, canvas)
  const repKey = representation.trim().toLowerCase()
  const extras = REPRESENTATION_EXTRAS[repKey] ?? []
  const hasArrow = extras.includes("arrow")
  const hasLine  = extras.includes("line")
  const hasFrame = extras.includes("frame")

  const parts: string[] = []

  // 1. Core: task, canvas, critical rules, anti-patterns
  parts.push(f(CORE))

  // 2. Element API — shapes + text always; line/arrow/frame conditional
  const elemSections = [ELEM_SHAPES, ELEM_TEXT]
  if (hasLine)  elemSections.push(ELEM_LINE)
  if (hasArrow) elemSections.push(ELEM_ARROW)
  if (hasFrame) elemSections.push(ELEM_FRAME)
  elemSections.push(ELEM_COMMON)
  parts.push(`## Elementos ExcalidrawElementSkeleton\n\n${elemSections.map(s => f(s)).join("\n\n")}`)

  // 3. Shapes meaning — only for diagram-heavy representations
  if (hasArrow) parts.push(SHAPES_MEANING)

  // 4. fillStyle hierarchy — always (server-side normalizer maps fillStyle → palette slot)
  parts.push(FILLSTYLE_TABLE)

  // 5. Contexto da apresentação (audiência/cenário/volume) — cor não depende
  // mais do tema aqui: `role` é resolvido em código a partir do tema real da
  // Presentation, depois da geração (ver theme-applicator.ts/skeleton-pipeline.ts)
  if (context) {
    const [min, max]   = AMOUNT_RANGE[context.amount]  ?? [4, 20]
    const audienceHint = AUDIENCE_HINTS[context.audience] ?? AUDIENCE_HINTS[0]
    const scenarioHint = SCENARIO_HINTS[context.scenario] ?? SCENARIO_HINTS[0]

    parts.push([
      `## Contexto da Apresentação`,
      ``,
      `**Audiência**: ${audienceHint}`,
      `**Cenário**: ${scenarioHint}`,
      `**Volume**: ${min}–${max} elementos por slide`,
    ].join("\n"))
  }
  parts.push(presentationThemes().buildSemanticRolesPrompt())

  // 6. Dimension, spacing and typography reference
  parts.push(REFERENCE_TABLES)

  // 7. Slide type guide (cover / content / closing)
  const typeGuide = SLIDE_TYPE_GUIDES[type]
  if (typeGuide) parts.push(f(typeGuide))

  // 8. Representation guide with embedded example
  const repGuide = REPRESENTATION_GUIDES[repKey]
  if (repGuide) parts.push(f(repGuide))

  // 9. Final constraints
  const volumeRule = context
    ? `- Respeite o volume indicado no Contexto da Apresentação`
    : `- Volume de elementos: 4–20 por slide`

  parts.push([
    `## Restrições Finais`,
    volumeRule,
    `- Limites do canvas: x 20–${canvas.width - 20}, y 20–${canvas.height - 20}`,
    `- Gere todo o conteúdo textual no idioma indicado`,
  ].join("\n"))

  return parts.join("\n\n")
}

export default buildSlideCreatorPrompt

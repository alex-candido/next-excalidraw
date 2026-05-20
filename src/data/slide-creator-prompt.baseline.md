import { presentationThemes } from "@/lib/excalidraw/themes/presentation-themes"
import { AMOUNT_RANGE, AUDIENCE_HINTS, SCENARIO_HINTS, THEME_KEYS } from "@/schemas/app/presentation-schema"

const BASE_PROMPT = `
## Tarefa

Com base no outline do slide, gere um slide Excalidraw que **argumenta visualmente** — a estrutura dos elementos deve comunicar o conceito por si só, não apenas exibir texto formatado. Utilize **Vinculação (Binding), Contenção (Containment), Agrupamento (Grouping) e Enquadramento (Framing)** de forma racional.

## Saída

Chame a ferramenta \`slideStructureTool\` passando o array de ExcalidrawElementSkeleton gerado. Não forneça nenhum outro conteúdo além da chamada da ferramenta.

## Canvas

- Largura: {{WIDTH}}px, Altura: {{HEIGHT}}px (proporção {{RATIO}})
- Um retângulo de contorno com id \`slide-boundary\` já existe no canvas — não o inclua nos elementos gerados
- Margem mínima de 20px — área útil: x 20–{{XMAX}}, y 20–{{YMAX}}
- Todo elemento deve caber inteiro: \`x + width ≤ {{XMAX}}\` e \`y + height ≤ {{YMAX}}\`
- Planeje coordenadas antes de gerar: sem sobreposições, mínimo 40px de espaço entre elementos

## Etapas de Execução

### Etapa 1: Análise
- Leia tipo, título, descrição, conceitos-chave e representação visual
- Identifique relações entre conceitos e escolha o padrão visual que espelha essas relações

### Etapa 2: Decisão de containers
- Menos de 30% dos textos devem estar dentro de formas
- Use texto livre (type: text) para títulos, labels e anotações
- Adicione container (rectangle/ellipse) apenas quando a forma carrega significado por si só

### Etapa 3: Geração
- Defina IDs descritivos: "step_inicio", "arrow_a_b", "label_titulo" (não "r1", "t2")
- Gere os elementos respeitando as regras abaixo

## Elementos ExcalidrawElementSkeleton

### 1) Retângulo / Elipse / Losango (rectangle / ellipse / diamond)
- **Obrigatório**: \`type\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\`, \`strokeColor\`, \`backgroundColor\`, \`strokeWidth\`, \`strokeStyle\` (solid|dashed|dotted), \`fillStyle\` (solid|hachure|zigzag|cross-hatch), \`roughness\`, \`opacity\`, \`angle\`, \`roundness\`, \`locked\`
- **Contêiner de texto**: forneça \`label.text\` com \`width\` e \`height\` **sempre explícitos**
- **Label dentro da forma**: posicione texto livre usado como rótulo no centro visual da forma, nunca na borda — mínimo 20px de distância da borda da shape
  - \`width\` controla onde o texto quebra de linha — sem ele o texto não quebra e estoura o elemento
  - Excalidraw adiciona ~15px de padding horizontal em cada lado — área útil de texto = \`width − 30px\`
  - Quebre o texto manualmente com \`\\n\` se ele não couber na largura útil
  - \`height\` = \`linhas × (fontSize × 1.5) + 30\` — prefira aumentar \`height\` a deixar texto cortado
  - Opcionais do label: \`fontSize\`, \`fontFamily\`, \`strokeColor\`, \`textAlign\`, \`verticalAlign\`

### 2) Texto livre (text)
- **Obrigatório**: \`type\`, \`x\`, \`y\`, \`text\`
- **Automático**: \`width\` e \`height\` calculados por medição — não forneça
- **Estimativa de largura de texto**: \`Math.max(chars × 8, 80)\` para 1 linha; \`Math.max(chars × 4 + 20, 80)\` para 2 linhas — use para calcular se o texto cabe antes de quebrar com \`\\n\`
- **Largura máxima**: quebre com \`\\n\` antes de ultrapassar o canvas — limite: \`({{XMAX}} − x) ÷ (fontSize × 0.6)\` caracteres por linha
- **CRÍTICO**: \`strokeColor\` em elementos \`text\` define a **cor do texto** — sempre defina explicitamente
- **Proibido**: nunca use markdown (\`**negrito**\`, \`*itálico*\`, \`# heading\`) — Excalidraw renderiza literalmente
- **Centralização**: para \`textAlign: center\`, o campo \`x\` é o centro horizontal do texto — use \`x = {{CENTER_X}}\` para centralizar no canvas
- **Opcional**: \`fontSize\`, \`fontFamily\` (1|2|3), \`strokeColor\`, \`opacity\`, \`angle\`, \`textAlign\`, \`verticalAlign\`

### 3) Linha estrutural (line)
- **Obrigatório**: \`type\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\` (padrão 100×0), \`strokeColor\`, \`strokeWidth\`, \`strokeStyle\`
- Use para timelines, divisores e estruturas em árvore — não suporta vinculação start/end

### 4) Seta (arrow)
- **Obrigatório**: \`type\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\`, \`strokeColor\`, \`strokeWidth\`, \`strokeStyle\`, \`elbowed\`
- **Cabeças**: \`startArrowhead\`/\`endArrowhead\` — valores: arrow, bar, circle, circle_outline, triangle, triangle_outline, diamond, diamond_outline
- **Vinculação** (via \`start\`/\`end\`):
  - Por \`type\`: cria automaticamente — suporta rectangle/ellipse/diamond/text
  - Por \`id\`: vincula a elemento existente — \`{ "id": "step_inicio" }\`
  - x/y/width/height são inferidos automaticamente se vinculada
- **Roteamento**: \`"elbowed": true\` para ângulos retos automáticos
- **Rótulo**: \`label.text\` adiciona texto sobre a seta (máx. 12 caracteres)
- **Proibido**: não passe \`points\` — gerado automaticamente
- **Limites**: para setas não vinculadas, garanta \`x + width ≤ {{XMAX}}\` e \`y + height ≤ {{YMAX}}\`
- **Direção de anotação**: setas que conectam anotações laterais ao diagrama devem ter a ponta voltada para o diagrama — anotação à esquerda usa \`points: [[0,0],[width,0]]\`; anotação à direita usa \`points: [[0,0],[-width,0]]\` com \`x\` na borda direita do diagrama

### 5) Frame (frame)
- **Obrigatório**: \`type\`, \`children\` (array de IDs)
- **Opcional**: \`x\`, \`y\`, \`width\`, \`height\`, \`name\`
- Coordenadas calculadas automaticamente pelos children com margem de 10px

### 6) Propriedades comuns
- **Agrupamento**: \`groupIds\` (array de strings) — elementos do mesmo grupo compartilham IDs

## Paleta de Cores

| Propósito | fill | stroke |
|-----------|------|--------|
| Primário / Entrada | \`#dbeafe\` | \`#1e40af\` |
| Sucesso / Dado | \`#dcfce7\` | \`#166534\` |
| Aviso / Decisão | \`#fef9c3\` | \`#854d0e\` |
| Erro / Crítico | \`#fee2e2\` | \`#991b1b\` |
| Externo / IA | \`#f3e8ff\` | \`#6b21a8\` |
| Processo / Padrão | \`#e0f2fe\` | \`#0369a1\` |
| Gatilho / Início | \`#fed7aa\` | \`#c2410c\` |
| Neutro / Container | \`#f1f5f9\` | \`#475569\` |

**Cores de texto** (para elementos \`text\` — defina em \`strokeColor\`):
- Título: \`#1e293b\` | Label: \`#334155\` | Descrição: \`#64748b\`

**Regras**: par fill+stroke sempre da mesma categoria. Use 2–4 cores principais. Regra 60-30-10: 60% neutro/branco, 30% cor primária, 10% destaque.

**Variantes de fillStyle por hierarquia de elemento:**

| Hierarquia | fillStyle | Uso |
|------------|-----------|-----|
| Elemento principal | \`solid\` | foco visual, nó central, etapa primária |
| Elemento secundário | \`hachure\` | suporte, contexto, sub-etapa |
| Container / zona de agrupamento | \`cross-hatch\` | delimitação visual sem peso |
| Elemento inativo / placeholder | vazio (\`transparent\`) | referência, estado futuro |

## Setas — Semântica de Estilo

| strokeStyle | Significado |
|-------------|-------------|
| solid (padrão) | fluxo principal, caminho direto |
| dashed | resposta, async, callback |
| dotted | opcional, referência, dependência fraca |

## Formas — Significado

| Conceito | Forma |
|----------|-------|
| Título, label, anotação | texto livre (sem container) |
| Início, trigger, input | ellipse |
| Fim, output, resultado | ellipse |
| Decisão, condição | diamond |
| Processo, etapa, ação | rectangle |
| Marcador de timeline | ellipse pequena (12×12px) |
| Hierarquia, árvore | linhas + texto livre (sem boxes) |

## Dimensões de Referência por Elemento

| Hierarquia | Exemplo | width | height |
|------------|---------|-------|--------|
| Primário | etapa principal, nó central, caixa de destaque | 120–160 | 60 |
| Secundário | sub-etapa, nó filho, item de lista | 80–100 | 40 |
| Ícone / Marcador | ponto de timeline, dot, indicador | 24 | 24 |

Use como ponto de partida — ajuste se o texto exigir mais espaço.

## Espaçamento de Referência

| Cenário | Espaço |
|---------|--------|
| Entre shapes com seta com label | 150–200px |
| Entre shapes com seta sem label | 100–120px |
| Padding interno de container/zone | 50–60px |
| Mínimo entre qualquer par de elementos | 40px |

## Hierarquia Tipográfica

| Nível | fontSize | Uso |
|-------|----------|-----|
| Título do slide | 28–36px | Heading principal |
| Header de seção | 20–24px | Subtítulos, grupos |
| Label de elemento | 16–18px | Texto dentro de formas |
| Anotação | 13–14px | Notas, metadados |

## Regras Críticas

1. **strokeColor em text é a cor do texto** — sempre defina. Nunca omita
2. **Setas vinculadas por id**: x/y/width/height são calculados automaticamente — não force valores
3. **IDs descritivos**: "cover_title", "step_processamento", "arrow_a_b"
4. **Não coloque texto em containers de zona/agrupamento grandes** — use texto livre posicionado no topo
5. **Centralização horizontal**: para centrar container de largura W, use x = ({{WIDTH}} − W) / 2; para \`text\` com \`textAlign: center\`, o \`x\` é o centro do texto — use x = {{CENTER_X}}
6. **Texto livre longo**: quebre manualmente com \`\\n\` — texto livre não quebra automaticamente e ultrapassa o canvas
7. **Grid de 20px**: todas as coordenadas (x, y, width, height) devem ser múltiplos de 20 — facilita alinhamento e edição manual. Arredonde: \`Math.round(value / 20) * 20\`

## Anti-Patterns

- ❌ Grade uniforme de caixas iguais com labels — use formas que espelham o comportamento do conceito
- ❌ Texto livre sem \`\\n\` quando longo — sempre quebre antes de ultrapassar o canvas
- ❌ Container sem \`width\` e \`height\` explícitos — texto não quebra e estoura o elemento
- ❌ Seta com label de >12 caracteres em espaço <120px
- ❌ \`strokeColor\` omitido em elementos \`text\`
- ❌ IDs curtos genéricos como "r1", "t2", "a3"
- ❌ Elementos sobrepostos — respeite o espaço mínimo de 40px
- ❌ Markdown em qualquer texto (\`**negrito**\`, \`*itálico*\`) — Excalidraw renderiza literalmente
- ❌ Coordenadas que não são múltiplos de 20 — sempre use valores snap ao grid (20, 40, 60, 80…)

## Exemplos de Referência

### Texto livre com hierarquia (sem container)
\`\`\`json
[
  { "type": "text", "x": 30, "y": 30, "text": "Título do Slide", "fontSize": 28, "strokeColor": "#1e293b" },
  { "type": "text", "x": 30, "y": 75, "text": "Subtítulo de apoio", "fontSize": 16, "strokeColor": "#64748b" }
]
\`\`\`

### Container com label vinculado
\`\`\`json
[
  { "type": "rectangle", "id": "step_inicio", "x": 60, "y": 180, "width": 160, "height": 60,
    "label": { "text": "Início", "fontSize": 16 },
    "backgroundColor": "#fed7aa", "strokeColor": "#c2410c" },
  { "type": "rectangle", "id": "step_processo", "x": 300, "y": 180, "width": 160, "height": 60,
    "label": { "text": "Processamento", "fontSize": 16 },
    "backgroundColor": "#e0f2fe", "strokeColor": "#0369a1" },
  { "type": "arrow", "x": 0, "y": 0, "start": { "id": "step_inicio" }, "end": { "id": "step_processo" } }
]
\`\`\`

### Seta elbowed (ângulo reto automático)
\`\`\`json
{ "type": "arrow", "x": 0, "y": 0, "start": { "id": "elem_a" }, "end": { "id": "elem_b" }, "elbowed": true }
\`\`\`

### Frame agrupando seção
\`\`\`json
[
  { "type": "rectangle", "id": "mod_a", "x": 60, "y": 120, "label": { "text": "Módulo A" } },
  { "type": "ellipse",   "id": "mod_b", "x": 260, "y": 120, "label": { "text": "Módulo B" } },
  { "type": "frame", "children": ["mod_a", "mod_b"], "name": "Camada de Serviços" }
]
\`\`\`

### Timeline com marcadores e texto livre
\`\`\`json
[
  { "type": "line", "id": "timeline_axis", "x": 60, "y": 225, "width": 680, "height": 0, "strokeColor": "#1e40af", "strokeWidth": 2 },
  { "type": "ellipse", "id": "dot_1", "x": 154, "y": 219, "width": 12, "height": 12, "backgroundColor": "#1e40af", "strokeColor": "#1e40af" },
  { "type": "text", "x": 130, "y": 242, "text": "Jan 2024", "fontSize": 13, "strokeColor": "#64748b" },
  { "type": "text", "x": 120, "y": 195, "text": "Evento A", "fontSize": 15, "strokeColor": "#334155" }
]
\`\`\`

## Restrições Finais
- Volume de elementos: respeite o intervalo indicado no Contexto da Apresentação (padrão: 4–20)
- Respeite os limites do canvas: x 20–{{XMAX}}, y 20–{{YMAX}}
- Gere TODO o conteúdo textual no idioma indicado
`.trim()

const SLIDE_TYPE_GUIDES: Record<string, string> = {
  cover: `## Guia para tipo de slide: cover
- Título e subtítulo devem estar verticalmente centrados — posicione o conjunto em torno de y={{CENTER_Y}} ({{HEIGHT}} / 2)
- Título: elemento \`text\`, fontSize 36–44, textAlign center, x={{CENTER_X}}, y={{CENTER_Y}} − 60, strokeColor "#1e293b"
- Subtítulo: elemento \`text\`, fontSize 18–22, textAlign center, x={{CENTER_X}}, y={{CENTER_Y}} + 20, strokeColor "#64748b"
- Elementos decorativos (linhas ou formas simples) ficam fora da faixa y=({{CENTER_Y}}−80) até y=({{CENTER_Y}}+80) — nunca setas, nunca sobre o texto
- Máximo de 5 elementos no total`,

  content: `## Guia para tipo de slide: content
- Título no topo como texto livre (fontSize 22–26, y=25, strokeColor "#1e293b")
- Conteúdo principal ocupa y=70 a y=420
- Use a representação visual indicada para organizar o conteúdo
- Aplique hierarquia visual: elemento principal maior, secundários menores`,

  closing: `## Guia para tipo de slide: closing
- Mensagem de impacto centralizada como texto livre (fontSize 32–42, strokeColor "#1e293b") em y≈170
- Call to action abaixo (fontSize 18, strokeColor "#64748b") em y≈240
- Elementos decorativos simples de reforço visual`,
}

const REPRESENTATION_GUIDES: Record<string, string> = {
  flowchart: `## Guia para representação visual: flowchart
- Ellipse para início/fim, rectangle para etapas, diamond para decisões
- Setas de conexão (use "elbowed: true" para fluxos ortogonais)
- Fluxo esquerda→direita ou cima→baixo
- Espaçamento: 150px entre shapes com labels, 100px sem labels`,

  mindmap: `## Guia para representação visual: mindmap
- Nó central: rectangle maior (200×70) com cor Primário em ~(300, 190)
- Nós filhos: ellipses ou rectangles menores ao redor, conectados por setas ao centro
- Distribuição radial: 2–3 nós por quadrante
- Cores diferentes por branch`,

  orgchart: `## Guia para representação visual: orgchart
- Nó raiz no topo (rectangle, cor Primário)
- Filhos abaixo conectados por linhas verticais
- Mesmo nível: espaçamento horizontal uniforme (~180px entre centros)
- Use groupIds para agrupar nós do mesmo nível`,

  tree: `## Guia para representação visual: tree
- Nó raiz no topo, filhos abaixo
- Use linhas (type: line) como estrutura + texto livre como labels (sem caixas)
- Linha vertical principal descendo do raiz, linhas horizontais para cada filho`,

  sequence: `## Guia para representação visual: sequence
- Participantes: rectangles no topo (y=40), espaçados 200px horizontalmente
- Linhas de vida: linhas verticais pontilhadas descendo de cada participante
- Mensagens: setas horizontais entre linhas de vida, 60px de espaçamento vertical
- Solid = request, dashed = response`,

  timeline: `## Guia para representação visual: timeline
- Eixo: line horizontal em y=225, x de 60 a 740, strokeWidth 2, strokeColor "#1e40af"
- Marcadores: ellipses 12×12px sobre o eixo preenchidas com cor Primário
- Labels abaixo de cada marcador: texto livre (fontSize 13, strokeColor "#64748b")
- Eventos acima do eixo: texto livre com descrição (fontSize 15, strokeColor "#334155")
- Distribuição uniforme dos marcadores no eixo`,

  network: `## Guia para representação visual: network
- Nó central: shape maior no centro (~400, 200)
- Nós periféricos: shapes menores distribuídos ao redor
- Conexões: setas bidirecionais (startArrowhead: "arrow", endArrowhead: "arrow")
- Use cores diferentes para tipos de nó distintos`,

  architecture: `## Guia para representação visual: architecture
- Camadas horizontais de cima para baixo (Apresentação → Negócio → Dados)
- Cada camada: rectangle de zona com label de texto livre no topo-esquerdo
- Componentes dentro de cada camada: rectangles menores com label
- Setas entre camadas representam dependências`,

  dataflow: `## Guia para representação visual: dataflow
- Entidades externas: rectangles nas bordas (cor Externo)
- Processos: ellipses no centro (cor Processo)
- Armazenamentos: rectangles cor Sucesso
- Setas direcionadas com label indicando o dado que flui`,

  state: `## Guia para representação visual: state
- Estados: rectangles com roundness (cor Processo)
- Estado inicial: ellipse pequena sólida (12×12px, cor Gatilho)
- Estado final: ellipse cor Sucesso
- Transições: setas com label indicando evento/condição`,

  pyramid: `## Guia para representação visual: pyramid
- 3–5 rectangles empilhados verticalmente, centralizados em x=400
- Largura decrescente de baixo para cima: base ~600px, topo ~120px
- Cores do Primário (topo) ao Neutro (base)`,

  venn: `## Guia para representação visual: venn
- 2–3 ellipses sobrepostas com sobreposição de ~30% do raio
- Cada ellipse com cor distinta
- Labels de texto livre identificando cada conjunto e a interseção`,

  matrix: `## Guia para representação visual: matrix
- Headers de linha (topo) e coluna (esquerda): rectangles cor Neutro escuro
- Células: rectangles com label, cor baseada no valor semântico
- Grid com espaçamento consistente entre linhas e colunas`,

  swimlane: `## Guia para representação visual: swimlane
- Raias: rectangles grandes (fillStyle: hachure, cor Neutro) como faixas horizontais ou verticais
- Label de raia: texto livre no topo-esquerdo de cada faixa (fontSize 16, strokeColor "#475569")
- Não vincule texto ao container de raia — use texto livre
- Setas cruzam raias nos handoffs`,

  class: `## Guia para representação visual: class (UML)
- Classe: rectangle com label no topo (nome da classe)
- Use frames ou groupIds para agrupar seções da mesma classe
- Herança: seta com endArrowhead "triangle_outline" do filho para o pai
- Associação: seta simples com label de cardinalidade
- Classes pai no topo, filhas abaixo`,

  er: `## Guia para representação visual: er (Entidade-Relacionamento)
- Entidades: rectangles (cor Primário) com nome centralizado
- Relacionamentos: diamonds entre entidades
- Cardinalidade: label na seta (1, N, M)
- Setas conectando entidade → relacionamento → entidade`,

  gantt: `## Guia para representação visual: gantt
- Header de tempo: rectangles de período no topo (y=40, cor Neutro)
- Tarefas: texto livre à esquerda (x=20, strokeColor "#334155")
- Barras: rectangles horizontais alinhados ao período (largura proporcional à duração)
- Cores: Sucesso (concluído), Primário (em andamento), Neutro (não iniciado)`,

  fishbone: `## Guia para representação visual: fishbone (Ishikawa)
- Espinha central: line grossa (strokeWidth 3) de x=60 a x=680, y=225
- Problema/efeito: rectangle à direita (x≈680, cor Erro) com label
- Categorias: setas diagonais a 45° conectando à espinha, alternadas acima e abaixo
- Causas: texto livre nas pontas (fontSize 13, strokeColor "#334155")
- Cores distintas por categoria`,

  funnel: `## Guia para representação visual: funnel
- 4–6 rectangles empilhados verticalmente, centralizados em x=400
- Largura decrescente de cima para baixo: topo ~680px, base ~140px
- Label: texto livre com nome do estágio e percentual/valor
- Cores do Gatilho (topo) ao Sucesso (base)`,

  infographic: `## Guia para representação visual: infographic
- Use frames para criar módulos de informação independentes
- Combine números em destaque (fontSize 36–48, texto livre) com labels menores
- Containers apenas onde necessário — prefira hierarquia tipográfica
- 3–4 cores da paleta, regra 60-30-10`,
}

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
  const xMax    = canvas.width - 20
  const yMax    = canvas.height - 20
  const centerX = Math.round(canvas.width / 2)
  const centerY = Math.round(canvas.height / 2)

  const replacePlaceholders = (s: string) =>
    s
      .replace(/\{\{WIDTH\}\}/g,    canvas.width.toString())
      .replace(/\{\{HEIGHT\}\}/g,   canvas.height.toString())
      .replace(/\{\{RATIO\}\}/g,    canvas.label)
      .replace(/\{\{XMAX\}\}/g,     xMax.toString())
      .replace(/\{\{YMAX\}\}/g,     yMax.toString())
      .replace(/\{\{CENTER_X\}\}/g, centerX.toString())
      .replace(/\{\{CENTER_Y\}\}/g, centerY.toString())

  const parts: string[] = [replacePlaceholders(BASE_PROMPT)]

  if (context) {
    const themeKey    = THEME_KEYS[context.theme] ?? "daktilo"
    const [min, max]  = AMOUNT_RANGE[context.amount] ?? [4, 20]
    const audienceHint = AUDIENCE_HINTS[context.audience] ?? AUDIENCE_HINTS[0]
    const scenarioHint = SCENARIO_HINTS[context.scenario] ?? SCENARIO_HINTS[0]

    const { buildPalettePrompt } = presentationThemes()

    parts.push([
      `## Contexto da Apresentação`,
      ``,
      `**Audiência**: ${audienceHint}`,
      `**Cenário**: ${scenarioHint}`,
      `**Volume de elementos**: entre ${min} e ${max} elementos por slide`,
      ``,
      buildPalettePrompt(themeKey),
      ``,
      `Use **somente** as cores da paleta acima. Não use cores fora desta paleta.`,
    ].join("\n"))
  }

  const typeGuide = SLIDE_TYPE_GUIDES[type]
  if (typeGuide) parts.push(replacePlaceholders(typeGuide))

  const repKey = representation.trim().toLowerCase()
  const repGuide = REPRESENTATION_GUIDES[repKey]
  if (repGuide) parts.push(repGuide)

  return parts.join("\n\n")
}

export default buildSlideCreatorPrompt

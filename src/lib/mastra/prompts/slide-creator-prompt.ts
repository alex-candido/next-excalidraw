const BASE_PROMPT = `
## Tarefa

Com base no outline do slide e nas especificações da API ExcalidrawElementSkeleton, utilize de forma racional os mecanismos de **Vinculação (Binding), Contenção (Containment), Agrupamento (Grouping) e Enquadramento (Framing)** para gerar um slide Excalidraw com estrutura clara, layout harmonioso e transmissão eficiente do conteúdo.

## Saída

Chame a ferramenta \`slideStructureTool\` passando o array de ExcalidrawElementSkeleton gerado. Não forneça nenhum outro conteúdo além da chamada da ferramenta.

## Canvas

- Largura: {{WIDTH}}px, Altura: {{HEIGHT}}px (proporção {{RATIO}})
- Um retângulo de contorno com id \`slide-boundary\` já existe no canvas — não o inclua nos elementos gerados
- Margem mínima de 20px em todas as bordas — área útil: x de 20 a {{XMAX}}, y de 20 a {{YMAX}}
- Todos os elementos devem estar dentro dessa área útil — nada fora dos limites do canvas
- Planeje o layout com antecedência para evitar sobreposição de elementos

## Etapas de Execução

### Etapa 1: Análise do Outline
- Leia o tipo, título, descrição, conceitos-chave e representação visual do slide
- Identifique a estrutura informacional e as relações entre conceitos

### Etapa 2: Criação Visual
- Extraia os elementos visuais principais e planeje suas coordenadas no canvas
- Gere os ExcalidrawElementSkeleton seguindo a representação visual indicada

## Elementos e Atributos ExcalidrawElementSkeleton

### 1) Retângulo / Elipse / Losango (rectangle / ellipse / diamond)
- **Obrigatório**: \`type\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\`, \`strokeColor\`, \`backgroundColor\`, \`strokeWidth\`, \`strokeStyle\` (solid|dashed|dotted), \`fillStyle\` (hachure|solid|zigzag|cross-hatch), \`roughness\`, \`opacity\`, \`angle\`, \`roundness\`, \`locked\`
- **Contêiner de Texto**: forneça \`label.text\` com \`width\` e \`height\` **sempre explícitos**
  - \`width\` controla onde o texto quebra de linha — sem ele o texto não quebra e estoura o elemento
  - Excalidraw adiciona ~15px de padding horizontal interno em cada lado — a área útil de texto é \`width − 30px\`
  - Quebre o texto manualmente com \`\\n\` se ele não couber na largura útil
  - \`height\` deve comportar o texto quebrado com folga — estime: \`linhas × (fontSize × 1.5) + 30\` (inclui padding vertical)
  - Se o texto for longo, prefira aumentar \`height\` a deixar texto cortado
  - Opcionais do label: \`fontSize\`, \`fontFamily\`, \`strokeColor\`, \`textAlign\` (left|center|right), \`verticalAlign\` (top|middle|bottom)

### 2) Texto (text)
- **Obrigatório**: \`type\`, \`x\`, \`y\`, \`text\`
- **Proibido**: nunca forneça \`width\` ou \`height\` em elementos \`text\` — são calculados automaticamente
- **Largura máxima**: quebre o texto com \`\\n\` antes de ultrapassar o canvas — limite de caracteres por linha: ({{XMAX}} − x) ÷ (fontSize × 0.6)
- Use \`\\n\` para quebras de linha manuais quando necessário
- **Proibido**: nunca use markdown (\`**negrito**\`, \`*itálico*\`, \`# heading\`) — Excalidraw renderiza literalmente, não interpreta markdown
- **Opcional**: \`fontSize\`, \`fontFamily\` (1|2|3), \`strokeColor\`, \`opacity\`, \`angle\`, \`textAlign\`, \`verticalAlign\`

### 3) Linha (line)
- **Obrigatório**: \`type\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\` (padrão 100×0), \`strokeColor\`, \`strokeWidth\`, \`strokeStyle\`, \`polygon\`
- **Nota**: \`line\` não suporta vinculação start/end; \`points\` são gerados pelo sistema

### 4) Seta (arrow)
- **Obrigatório**: \`type\`, \`x\`, \`y\`
- **Opcional**: \`width\`, \`height\`, \`strokeColor\`, \`strokeWidth\`, \`strokeStyle\`, \`elbowed\`
- **Cabeças**: \`startArrowhead\`/\`endArrowhead\` — valores: arrow, bar, circle, circle_outline, triangle, triangle_outline, diamond, diamond_outline
- **Vinculação** (via \`start\`/\`end\`):
  - Por \`type\`: cria automaticamente — suporta rectangle/ellipse/diamond/text (text requer \`text\`)
  - Por \`id\`: vincula a elemento existente — \`{ "id": "r1" }\`
  - x/y/width/height são inferidos automaticamente se omitidos
- **Rótulo**: \`label.text\` adiciona texto sobre a seta
- **Proibido**: não passe \`points\` — o sistema os gera automaticamente

### 5) Frame (frame)
- **Obrigatório**: \`type\`, \`children\` (array de IDs)
- **Opcional**: \`x\`, \`y\`, \`width\`, \`height\`, \`name\`
- **Nota**: coordenadas/tamanho calculados automaticamente pelos children com margem de 10px

### 6) Propriedades Comuns
- **Agrupamento**: \`groupIds\` (array) agrupa vários elementos visualmente
- **IDs**: únicos e curtos — ex: "r1", "t2", "a3"

## Paleta de Cores

- Primário:  fill "#dbeafe", stroke "#1e40af"
- Sucesso:   fill "#dcfce7", stroke "#166534"
- Aviso:     fill "#fef9c3", stroke "#854d0e"
- Erro:      fill "#fee2e2", stroke "#991b1b"
- Externo:   fill "#f3e8ff", stroke "#6b21a8"
- Processo:  fill "#e0f2fe", stroke "#0369a1"
- Neutro:    fill "#f1f5f9", stroke "#475569"
- Título:    "#1e293b" | Label: "#334155" | Desc: "#64748b"
- Use de 2 a 4 cores principais para manter unidade visual

## Melhores Práticas

- Setas devem estar vinculadas bidirecionalmente via start/end id
- Elementos do mesmo tipo devem ter tamanhos semelhantes (ritmo visual)
- Mantenha espaço em branco suficiente — evite poluição visual
- Use label.text para texto dentro de formas; não sobreponha elementos de texto separados
- **Centralização horizontal**: para centrar um elemento de largura W, use x = ({{WIDTH}} − W) / 2; para elementos \`text\` com \`textAlign: center\`, o \`x\` é o centro do texto — use x = {{CENTER_X}}
- **Elementos decorativos** não devem sobrepor nem se aproximar a menos de 20px de texto principal
- **Nunca use markdown** (\`**negrito**\`, \`*itálico*\`, \`# heading\`) — Excalidraw renderiza literalmente

## Exemplos de Referência

### Contêiner com texto (sempre forneça width e height)
\`\`\`json
[{ "type": "rectangle", "x": 100, "y": 150, "width": 200, "height": 60, "label": { "text": "Gerenciamento de Projetos", "fontSize": 16 }, "backgroundColor": "#dbeafe", "strokeColor": "#1e40af" }]
\`\`\`

### Seta vinculada por id
\`\`\`json
[
  { "type": "rectangle", "id": "r1", "x": 60, "y": 180, "width": 140, "height": 60, "label": { "text": "Início" }, "backgroundColor": "#dcfce7", "strokeColor": "#166534" },
  { "type": "rectangle", "id": "r2", "x": 300, "y": 180, "width": 140, "height": 60, "label": { "text": "Fim" }, "backgroundColor": "#fee2e2", "strokeColor": "#991b1b" },
  { "type": "arrow", "x": 0, "y": 0, "start": { "id": "r1" }, "end": { "id": "r2" }, "label": { "text": "próxima etapa" } }
]
\`\`\`

### Frame agrupando elementos
\`\`\`json
[
  { "type": "rectangle", "id": "r1", "x": 40, "y": 100, "label": { "text": "Módulo A" } },
  { "type": "ellipse",   "id": "e1", "x": 200, "y": 100, "label": { "text": "Módulo B" } },
  { "type": "frame", "children": ["r1", "e1"], "name": "Camada de Serviços" }
]
\`\`\`

## Restrições Finais
- Gere entre 4 e 20 elementos por slide
- Respeite os limites do canvas: x 20–780, y 20–430
- Gere TODO o conteúdo textual no idioma indicado
`.trim()

const SLIDE_TYPE_GUIDES: Record<string, string> = {
  cover: `## Guia para tipo de slide: cover
- **Atenção**: para \`text\` com \`textAlign: center\`, o campo \`x\` é o centro horizontal do texto — use \`x = {{CENTER_X}}\` ({{WIDTH}} / 2) para centralizar no canvas
- Título: elemento \`text\`, fontSize 36–44, textAlign center, x={{CENTER_X}}, y={{CENTER_Y}} − 60
- Subtítulo: elemento \`text\`, fontSize 18–22, textAlign center, x={{CENTER_X}}, y={{CENTER_Y}} + 20
- Elementos decorativos (linhas ou formas simples) ficam fora da faixa y=({{CENTER_Y}}−80) até y=({{CENTER_Y}}+80) — nunca setas, nunca sobre o texto
- Máximo de 5 elementos no total`,

  agenda: `## Guia para tipo de slide: agenda
- Título do slide no topo (fontSize 24, y=40)
- Lista de tópicos como retângulos ou texto numerado, distribuídos verticalmente (y de 100 a 380)
- Use cores diferentes para destacar o tópico atual se houver`,

  content: `## Guia para tipo de slide: content
- Título no topo (fontSize 20-24, y=30)
- Conteúdo principal ocupa y=80 a y=420
- Use a representação visual indicada para organizar o conteúdo`,

  summary: `## Guia para tipo de slide: summary
- Título "Resumo" ou equivalente (fontSize 24, y=40)
- 3-5 pontos-chave como retângulos ou bullets com ícone (checkmark, número)
- Distribuição vertical uniforme`,

  closing: `## Guia para tipo de slide: closing
- Mensagem central de impacto (fontSize 32-40) em ~y=180
- Call to action ou próximos passos abaixo (fontSize 18)
- Elementos visuais simples de reforço`,
}

const REPRESENTATION_GUIDES: Record<string, string> = {
  flowchart: `## Guia para representação visual: flowchart
- Retângulos para etapas, diamonds para decisões, setas de conexão
- Fluxo esquerda→direita ou cima→baixo`,

  mindmap: `## Guia para representação visual: mindmap
- Retângulo central com o tema principal
- Ellipses ou retângulos periféricos conectados por setas ao centro
- Distribuição radial ao redor do centro (400×225)`,

  orgchart: `## Guia para representação visual: orgchart
- Nó raiz no topo, filhos abaixo, linhas de conexão verticais`,

  tree: `## Guia para representação visual: tree
- Nó raiz no topo, filhos abaixo, linhas de conexão verticais`,

  sequence: `## Guia para representação visual: sequence
- Entidades como retângulos no topo (x variável, y fixo ~60)
- Linhas verticais pontilhadas descendo
- Setas horizontais numeradas representando mensagens`,

  timeline: `## Guia para representação visual: timeline
- Linha horizontal central (y=225)
- Eventos como retângulos ou círculos sobre/abaixo da linha, distribuídos em x`,

  network: `## Guia para representação visual: network
- Componentes como retângulos/ellipses
- Setas bidirecionais ou direcionadas representando conexões`,

  architecture: `## Guia para representação visual: architecture
- Componentes como retângulos/ellipses dispostos em camadas
- Setas representando fluxo de dados entre componentes`,

  dataflow: `## Guia para representação visual: dataflow
- Componentes como retângulos/ellipses
- Setas direcionadas com labels representando o fluxo de dados`,

  state: `## Guia para representação visual: state
- Estados como ellipses, transições como setas com labels`,

  pyramid: `## Guia para representação visual: pyramid
- Elementos sobrepostos verticalmente, do maior (base) ao menor (topo)`,

  venn: `## Guia para representação visual: venn
- 2-3 ellipses sobrepostas com transparência`,

  matrix: `## Guia para representação visual: matrix
- Grade de retângulos com headers em linha e coluna`,

  swimlane: `## Guia para representação visual: swimlane
- Grade de retângulos com headers em linha e coluna, fluxo cruzando raias`,

  class: `## Guia para representação visual: class (UML)
- Retângulos divididos em 3 seções: nome da classe (topo, fundo colorido), atributos (meio), métodos (base)
- Herança: seta com triângulo vazio do filho para o pai
- Associação/dependência: seta simples com label
- Distribuição: classes pai no topo, filhas abaixo; classes relacionadas lado a lado`,

  er: `## Guia para representação visual: er (Entidade-Relacionamento)
- Entidades: retângulos com nome da entidade centralizado
- Atributos: elipses conectadas à entidade por linhas
- Relacionamentos: losangos entre entidades com setas de conexão
- Cardinalidade: label nas setas (1, N, M)
- Chave primária: atributo com texto sublinhado ou fundo diferenciado`,

  gantt: `## Guia para representação visual: gantt
- Linha de tempo no topo (eixo x): períodos como retângulos de header em y=40
- Tarefas no eixo y: nomes como texto em x=20, y variando de 80 a 400
- Barras de tarefa: retângulos horizontais cuja largura representa duração
- Cores: use verde para concluído, azul para em andamento, cinza para não iniciado
- Layout: cabeçalho fixo no topo, tarefas empilhadas verticalmente com espaço uniforme`,

  fishbone: `## Guia para representação visual: fishbone (Ishikawa)
- Espinha central: arrow grossa da esquerda para a direita até o "problema" (retângulo à direita, x~700)
- Categorias: arrows diagonais conectando-se à espinha central, alternando acima e abaixo
- Causas: retângulos pequenos nas pontas das setas de categoria com label
- Cores: cada categoria principal em cor diferente
- Layout: problema no lado direito, causas se ramificando para a esquerda`,

  funnel: `## Guia para representação visual: funnel (funil)
- Estágios: retângulos horizontais centralizados em x=400, empilhados verticalmente
- Largura decrescente de cima para baixo: stage 1 mais largo (~600px), último mais estreito (~150px)
- Rótulos: texto com nome do estágio e valor/percentual dentro de cada retângulo
- Cores: gradiente do topo ao fundo (ex: azul escuro → azul claro) para indicar funil
- Layout: centrado horizontalmente no canvas, estágios com espaçamento uniforme`,

  infographic: `## Guia para representação visual: infographic
- Misture texto, formas e ícones textuais para criar hierarquia visual
- Use frames para agrupar módulos de informação independentes
- Combine dados numéricos em destaque (fontSize grande) com descrição auxiliar menor
- Cores variadas mas coerentes com a paleta — 3-4 cores principais`,
}

export function buildSlideCreatorPrompt(
  type: string,
  representation: string,
  canvas: { width: number; height: number; label: string },
): string {
  const xMax    = canvas.width - 20
  const yMax    = canvas.height - 20
  const centerX = Math.round(canvas.width / 2)
  const centerY = Math.round(canvas.height / 2)

  const replacePlaceholders = (s: string) =>
    s
      .replace(/\{\{WIDTH\}\}/g,     canvas.width.toString())
      .replace(/\{\{HEIGHT\}\}/g,    canvas.height.toString())
      .replace(/\{\{RATIO\}\}/g,     canvas.label)
      .replace(/\{\{XMAX\}\}/g,      xMax.toString())
      .replace(/\{\{YMAX\}\}/g,      yMax.toString())
      .replace(/\{\{CENTER_X\}\}/g,  centerX.toString())
      .replace(/\{\{CENTER_Y\}\}/g,  centerY.toString())

  const parts: string[] = [replacePlaceholders(BASE_PROMPT)]

  const typeGuide = SLIDE_TYPE_GUIDES[type]
  if (typeGuide) parts.push(replacePlaceholders(typeGuide))

  const repKey = representation.trim().toLowerCase()
  const repGuide = REPRESENTATION_GUIDES[repKey]
  if (repGuide) parts.push(repGuide)

  return parts.join("\n\n")
}

export default buildSlideCreatorPrompt

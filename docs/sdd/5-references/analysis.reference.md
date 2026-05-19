# Reference: Analysis

Análise dos repositórios de referência clonados em `temp/` e o que podemos aproveitar no projeto.

---

## Repositórios Analisados

| Repo | Propósito | Relevância |
|------|-----------|------------|
| `smart-excalidraw-next` | Pipeline AI principal (já analisado) | Alta — referência base |
| `presentation-ai` | Plataforma completa: agent editing, PPTX export, themes, Plate.js | Alta — referência de produto |
| `excalidraw-diagram-skill` | Filosofia de design, templates de elementos | Alta — melhorias de prompt |
| `excalidraw-skill` | Spacing, anti-patterns, tipografia | Alta — melhorias de prompt |
| `ai-excalidraw` | Regras de largura de texto, suporte multilíngue | Média — melhorias pontuais |
| `inscribed` | Editor e modo apresentação com Excalidraw | Alta — referência UI |
| `mcp-excalidraw` | Servidor MCP com 26 ferramentas CRUD | Baixa — fora do escopo |
| `excalidraw-mcp` | Servidor MCP alternativo | Baixa — fora do escopo |
| `excalidraw-ai` | Monorepo oficial do Excalidraw | Baixa — já usamos via npm |
| `awesome-copilot` | 8 templates de diagrama em Markdown | Baixa — abordagem diferente |

---

## 1. Pipeline AI / Prompts

### Já implementado em `slide-creator-prompt.v2.ts`

As melhorias abaixo foram extraídas de `excalidraw-diagram-skill` e `excalidraw-skill` e já aplicadas na v2:

- **"Argue, not display"** — slides devem construir argumento visual, não apenas listar conteúdo
- **Container discipline** — `<30%` dos elementos de texto devem estar dentro de shapes
- **IDs descritivos** — `"step_inicio"` em vez de `"r1"`, `"arrow_aprovacao"` em vez de `"a1"`
- **`strokeColor` em texto = cor do texto** — invisível se omitido (crítico)
- **`boundElements: null`** em vez de `[]` quando não há ligações
- **`elbowed: true`** para roteamento em ângulo reto de setas
- **Paleta semântica de cores** — 8 categorias com valores hex fixos
- **Semântica de `strokeStyle`** — solid (fluxo), dashed (opcional), dotted (async/delay)
- **Tabela de espaçamento** — referência de 40/60/80/120px por contexto
- **Hierarquia tipográfica** — fontSize: 28 (título), 20 (subtítulo), 16 (corpo), 12 (caption)
- **Anti-patterns explícitos** — textos sobrepostos, setas sem destino, shapes excessivos

### Pendente de implementar

#### De `excalidraw-diagram-skill`

- **Regra de proporcionalidade de elementos**: shapes primários `~120×60`, secundários `~80×40`, ícones `~24×24` — definir tabela padrão de dimensões por categoria
- **Fórmula de largura de texto**: `width = Math.max(chars * 8, 80)` para uma linha, `chars * 8 / 2 + 20` para duas linhas — evita texto truncado
- **Paleta estendida de 4 tons por cor**: cada cor semântica com variantes de fill `hachura/sólido/vazio` dependendo de hierarquia
- **Regra de alinhamento de grid**: snap de 20px em todos os eixos — coordenadas sempre múltiplos de 20

#### De `ai-excalidraw`

- **Cálculo de largura real por idioma**: português/espanhol têm ~15% mais caracteres que inglês para o mesmo conteúdo → `width *= 1.15` para `pt`/`es`
- **Regra de altura mínima de container**: `height = lines * lineHeight + padding * 2`, onde `lineHeight = fontSize * 1.5`

#### Aplicação sugerida

Criar `src/lib/excalidraw/utils/element-sizing.ts` com funções utilitárias:

```typescript
export function calcTextWidth(text: string, language: string): number
export function calcContainerHeight(lines: number, fontSize: number): number
export function snapToGrid(value: number, gridSize = 20): number
```

Essas funções podem ser usadas tanto nos generators quanto injetadas como contexto no prompt (ex: calcular larguras antes de enviar ao LLM).

---

## 2. lib/excalidraw

### Geradores

Os generators em `src/lib/excalidraw/generators/` são usados apenas no sandbox, não no pipeline AI. Os repos de referência usam a mesma abordagem de `ExcalidrawElementSkeleton` — nenhuma melhoria crítica foi identificada.

### Melhorias pontuais identificadas

- **`normalizeArrows`**: repositórios de referência não têm equivalente — nossa implementação está acima da média
- **`validateSkeletons`**: adicionar validação de `strokeColor` em elementos `text` como parte do pipeline (retornar erro ou aplicar fallback `#1e1e1e` se ausente)
- **`parseSkeletons`**: adicionar suporte a output com múltiplos blocos JSON separados (LLMs às vezes dividem em chunks)

---

## 3. Editor Mode (`/presentations/[id]/editor`)

### Referência principal: `inscribed/Canvas.tsx`

#### Padrão de uso do `ExcalidrawImperativeAPI`

```typescript
const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)

// Foco no frame do slide atual
excalidrawAPI?.scrollToContent(frame, { fitToViewport: true })

// Salvar estado ao sair do slide
const copy = (elements) => elements.map(el => ({ ...el }))
updateSlide(currentSlideIndex, copy(excalidrawAPI.getSceneElements()))
```

#### Estrutura de layout

```
┌─────────────────────────────────────┐
│  Toolbar (top, fixo)                │
├──────────────┬──────────────────────┤
│  SlideList   │  Canvas (Excalidraw) │
│  (sidebar    │  (área principal)    │
│   esquerda)  │                      │
└──────────────┴──────────────────────┘
```

#### Navegação no SlideList

- Drag-drop para reordenar slides
- Multi-seleção com `Shift+click`
- Atalhos: `↑↓` para navegar, `Ctrl+D` duplicar, `Ctrl+C/V` copiar/colar slide

#### Consideração importante

`inscribed` usa **frames do Excalidraw** como contêiner de cada slide — cada slide é um frame nomeado. Navegar entre slides = `scrollToContent(frame, { fitToViewport: true })`. Precisamos avaliar se adotaremos frames ou slides separados (um arquivo de elements por slide).

---

## 4. Present Mode (`/presentations/[id]/present`)

### Referência principal: `inscribed/PresentationMode.tsx`

#### Abordagem: `exportToImageUrls`

Converte todos os slides para imagens antes de iniciar a apresentação:

```typescript
// Gera array de URLs de imagem para cada slide (frame)
const urls: string[] = await exportToImageUrls(slides, excalidrawAPI)

// Exibe como <img> fullscreen com navegação
<img src={urls[currentIndex]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
```

Vantagens: performance máxima, sem re-render do canvas durante apresentação.

#### Navegação

- Teclado: `←` / `→` para navegar, `ESC` para fechar
- Touch: swipe left/right
- Click: área esquerda (voltar) / área direita (avançar)

#### Modo leitura (`ReadOnlyCanvas.tsx`)

Alternativa para exibir o canvas em modo somente-leitura (com toolbar oculta):

```typescript
<Excalidraw
  viewModeEnabled={true}
  zenModeEnabled={true}
  initialData={{ elements, appState: { ... } }}
/>
```

Toolbar ocultada via CSS: `.excalidraw .App-toolbar { display: none }`.

---

## 5. Priorização de Implementação

### Alta prioridade (próximo ciclo)

| Item | Origem | Onde implementar |
|------|--------|------------------|
| Conectar `slideWorkflow` à API route | — | `src/app/api/v1/app/` |
| Persistir outline no banco | — | `src/actions/app/` |
| Persistir slides no banco | — | `src/actions/app/` |
| Página `/presentations/new` com form | — | `src/app/[lang]/(app)/` |
| Validação `strokeColor` em `validateSkeletons` | `ai-excalidraw` | `src/lib/excalidraw/parse/` |

### Média prioridade

| Item | Origem | Onde implementar |
|------|--------|------------------|
| Fórmula de largura de texto por idioma | `ai-excalidraw` | `src/lib/excalidraw/utils/` |
| Tabela de dimensões padrão por elemento | `excalidraw-diagram-skill` | `slide-creator-prompt` |
| Regra de snap de grid (múltiplos de 20) | `excalidraw-diagram-skill` | `slide-creator-prompt` |
| Página `/presentations/[id]/editor` | `inscribed` | `src/app/[lang]/(app)/` |
| Página `/presentations/[id]/present` | `inscribed` | `src/app/[lang]/(app)/` |

### Baixa prioridade / backlog

| Item | Origem | Onde implementar |
|------|--------|------------------|
| `element-sizing.ts` utilities | `ai-excalidraw` | `src/lib/excalidraw/utils/` |
| Suporte a múltiplos chunks JSON no parser | — | `src/lib/excalidraw/parse/` |
| Slide-composition pipeline | — | `src/lib/mastra/workflows/` |

---

## 6. `presentation-ai` — Análise

Plataforma completa de criação e edição de apresentações com AI. Stack: Next.js 16, LangChain/LangGraph, Plate.js, Prisma, PptxGenJS.

> Arquivos principais: `temp/presentation-ai/src/ai/agents/presentation/createAgent.ts`, `src/lib/presentation/themes.ts`, `src/components/notebook/presentation/utils/templates.tsx`

---

### 6.1 Agent de Edição — Chat Interativo

#### Arquitetura

O agent usa LangGraph com streaming via Vercel AI SDK. O frontend serializa os slides em XML e envia como contexto a cada mensagem.

**Backend** (`src/app/api/agent/presentation/route.ts`):
- Recebe: `id` (presentationId), `messages[]`, `modelProvider`, `modelId`
- Cria grafo via `createPresentationGraph()` com LangGraph
- Retorna stream via `createUIMessageStreamResponse()`

**Frontend** (`src/components/presentation/agent/PresentationAgentPanel.tsx`):
- Hook `useChat` do `@ai-sdk/react` gerencia o estado do chat
- Detecta tool calls no stream → executa via `executeToolCall()` → resume stream com `regenerate()`
- Cada tool call tem componente de preview (ex: `ChangeTheme.tsx`, `ReplaceImageCompare.tsx`)

#### Tools disponíveis (8)

| Tool | O que faz | Scope |
|------|-----------|-------|
| `edit_slide_properties` | bgColor, alignment, layoutType, width | slideIds ou "all" |
| `replace_image` | substitui imagem por URL ou prompt de geração | slideIds |
| `change_theme` | aplica tema pré-definido | global |
| `regenerate_slide` | regera slide com novo conteúdo XML | slideIds[] |
| `create_slide` | cria slide em posição específica | afterSlideId opcional |
| `delete_slide` | remove slides | slideIds[] |
| `webSearch` | busca web via Tavily para contexto | — |
| `respond_to_user` | responde sem editar (clarificação) | — |

#### Middleware pattern (importante)

```
pastedContentMiddleware          → processa conteúdo colado com offset
trimMessageHistory               → limita contexto a últimas 4 mensagens
enforceStructuredToolCallsForLocalModels → retry + JSON fallback para Ollama/LMStudio
```

**O que aproveitar:** o modelo de 8 tools é o blueprint para o nosso agent de edição (Ciclo 3). O middleware de retry automático + JSON fallback resolve o problema de LLMs que falham em tool calls — aplicar no Mastra workflow com `retryConfig`.

**Adaptação para nosso stack:** as tools operam sobre `ExcalidrawElementSkeleton[]` em vez de XML Plate. A serialização muda, o conceito de tool é idêntico.

---

### 6.2 Colaboração e Compartilhamento

O `presentation-ai` **não tem colaboração em tempo real** — sem Y.js, sem WebSocket. O modelo é simples:

- `BaseDocument.isPublic: boolean` — público ou privado
- `canReadDocument()`: `isPublic || userId === owner`
- `canEditDocument()`: apenas o dono

**Arquivos:** `temp/presentation-ai/src/server/share/authorization.ts`

**O que aproveitar:** modelo de autorização simples como ponto de partida. Para colaboração real nosso schema já tem `presentation_member` — o `presentation-ai` não cobre isso.

**Nosso diferencial:** `presentation_member` + `group` + `user_group` no schema permitem controle granular (owner / editor / viewer) sem precisar criar novas tabelas.

---

### 6.3 Sistema de Temas

**Arquivo:** `temp/presentation-ai/src/lib/presentation/themes.ts`

#### Estrutura do objeto de tema (`ThemeProperties`)

```ts
{
  name:         string
  description:  string
  mode:         "light" | "dark"
  colors: {
    primary:         string   // cor principal (botões, destaques)
    accent:          string   // cor de destaque
    background:      string   // fundo do slide
    text:            string   // texto corrido
    heading:         string   // títulos
    smartLayout:     string   // elementos de layout
    cardBackground:  string   // fundo de cards/shapes
  }
  fonts: {
    heading:       string     // nome da fonte de título
    body:          string     // nome da fonte de corpo
    headingWeight: string     // peso (ex: "700")
    bodyWeight:    string     // peso (ex: "400")
    // URLs opcionais para Google Fonts
  }
  borderRadius: {
    card:   string
    slide:  string
    button: string
  }
  transitions:  { default: string }
  shadows: {
    card:   string
    button: string
    slide:  string
  }
  background?: {
    type:     "solid" | "linear" | "radial" | "image"
    override: string          // CSS direto
    gradient: {
      type:    string
      angle:   number
      stops:   { id: string; color: string; position: number }[]
    }
    imageUrl: string
  }
}
```

41 temas pré-definidos: daktilo, noir, cornflower, indigo, orbit, cosmos, piano, ebony, mystique, phantom, crimson, ember, sunset, forest, aurora, sakura, ocean, sand, lavender, rose, honey, coral, glacier, jade, etc.

**O que aproveitar (Ciclo 4):** a estrutura `ThemeProperties` com `colors`, `fonts` e `background` é o modelo para nosso sistema de temas. No contexto Excalidraw, `colors` mapeiam para `strokeColor`/`backgroundColor` dos elements e `appState.viewBackgroundColor`.

---

### 6.4 Sistema de Templates

**Arquivo:** `temp/presentation-ai/src/components/notebook/presentation/utils/templates.tsx`

Biblioteca de templates pré-montados organizados por categoria. Templates são `PlateSlide` sem ID — não requerem geração AI.

#### Tipos de template disponíveis

| Categoria | Templates |
|-----------|-----------|
| Listas | bullet list, numbered list, arrow list |
| Boxes | solid, outline, icon, sideline, joined, leaf |
| Gráficos | bar, pie, line, area, radar, scatter, heatmap, ohlc, boxPlot (20+ tipos via AntV) |
| Processos | cycle, staircase, pyramid/funnel, timeline (arrows, pills, parallelograms) |
| Comparação | before-after, pros/cons |
| Especiais | stats/KPIs, quote, table, embed |

**Interface de template:**

```ts
{
  id:         string
  name:       string
  categoryId: string
  preview:    React.ReactNode   // miniatura visual
  template:   Omit<PlateSlide, "id">
}
```

**O que aproveitar (Ciclo 3):** o conceito de template como `ExcalidrawElementSkeleton[]` pré-montado. Nossa implementação em `lib/excalidraw/templates/` seguirá a mesma estrutura de categorias. Os tipos de template mapeiam diretamente para nossos `OutlineRepresentation` (flowchart, mindmap, timeline, etc.).

---

### 6.5 Exportação PPTX

**Arquivo:** `temp/presentation-ai/src/components/presentation/export/domToPptxConverter.ts`

Conversão DOM → PPTX client-side via PptxGenJS + Fabric.js. Faz scan do canvas para extrair posicionamento preciso de cada elemento.

**O que aproveitar (Ciclo 4):** abordagem 100% client-side — sem servidor ou LibreOffice. No nosso caso, a conversão parte de `ExcalidrawElement[]` e não de DOM, mas o PptxGenJS é o mesmo destino.

---

### 6.6 O que NÃO aproveitar deste repo

| O que | Por quê |
|-------|---------|
| Plate.js como editor | Incompatível com Excalidraw skeleton — é editor WYSIWYG de texto rico |
| LangChain/LangGraph | Já usamos Mastra; conceitos de tools são transferíveis, stack não |
| XML como formato de slide | Usamos `ExcalidrawElementSkeleton[]` — mais estruturado e tipado |
| Schema Prisma | Já temos Drizzle com schema mais rico (Generation, Log, enums tipados) |
| Multi-provider (Ollama/LMStudio) | Fora do escopo atual; nosso modelo dinâmico será via Gemini/Anthropic |

---

## 7. O que NÃO aproveitar

- **`mcp-excalidraw` / `excalidraw-mcp`**: Abordagem MCP (Model Context Protocol) expõe CRUD de elementos como tools. Não se aplica — nosso pipeline é server-side via Mastra workflow.
- **`excalidraw-ai`** (monorepo oficial): Já usamos `@excalidraw/excalidraw` como dependência npm. O monorepo tem muito mais do que precisamos.
- **`awesome-copilot`**: Templates baseados em Markdown/texto, não em skeleton API. Abordagem incompatível com nosso pipeline.

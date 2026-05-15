# References Analysis

Análise dos repositórios de referência clonados em `temp/` e o que podemos aproveitar no projeto.

---

## Repositórios Analisados

| Repo | Propósito | Relevância |
|------|-----------|------------|
| `smart-excalidraw-next` | Pipeline AI principal (já analisado) | Alta — referência base |
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

## 6. O que NÃO aproveitar

- **`mcp-excalidraw` / `excalidraw-mcp`**: Abordagem MCP (Model Context Protocol) expõe CRUD de elementos como tools. Não se aplica — nosso pipeline é server-side via Mastra workflow.
- **`excalidraw-ai`** (monorepo oficial): Já usamos `@excalidraw/excalidraw` como dependência npm. O monorepo tem muito mais do que precisamos.
- **`awesome-copilot`**: Templates baseados em Markdown/texto, não em skeleton API. Abordagem incompatível com nosso pipeline.

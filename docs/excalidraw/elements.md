# Excalidraw Elements — Referência Consolidada

> Baseado na análise de: smart-excalidraw-next, excalidraw_ai, awesome-copilot, mcp_excalidraw, excalidraw-skill

---

## API Principal

### `ExcalidrawElementSkeleton` + `convertToExcalidrawElements`

A abordagem correta é usar o formato simplificado `ExcalidrawElementSkeleton` e converter para o formato completo usando a função oficial do pacote:

```ts
import { convertToExcalidrawElements } from "@excalidraw/excalidraw"

const elements = convertToExcalidrawElements(skeletons, { regenerateIds: false })
```

Os generators do projeto retornam `ExcalidrawElementSkeleton[]`. O `serialize/` chama `convertToExcalidrawElements` para produzir o output final.

---

## Estrutura do Arquivo `.excalidraw`

```ts
interface ExcalidrawFile {
  type: "excalidraw"
  version: 2
  source: "https://excalidraw.com"
  elements: ExcalidrawElement[]
  appState: {
    viewBackgroundColor: string  // ex: "#ffffff"
    gridSize: 20
  }
  files: {}
}
```

---

## Campos Base (todos os elementos)

```ts
interface BaseElement {
  id: string                    // único, descritivo: "rect-1", "arrow-gw-to-auth"
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  angle: number                 // radianos, geralmente 0
  strokeColor: string           // hex
  backgroundColor: string       // hex ou "transparent"
  fillStyle: "solid" | "hachure" | "cross-hatch" | "zigzag"
  strokeWidth: number           // 1-4
  strokeStyle: "solid" | "dashed" | "dotted"
  roughness: number             // 0-2 (0 = limpo, 1 = default, 2 = muito riscado)
  opacity: number               // 0-100
  groupIds: string[]            // innermost-first para grupos aninhados
  frameId: string | null        // null geralmente
  boundElements: BoundElement[] | null  // NUNCA [], sempre null quando vazio
  seed: number                  // inteiro positivo único
  version: number               // 1
  versionNonce: number
  isDeleted: false
  updated: 1                    // sempre 1, não timestamp
  link: null
  locked: false
}
```

**Campos gerados automaticamente pelo `convertToExcalidrawElements`** (não incluir nos generators):
`seed`, `version`, `versionNonce`, `index`, `updated`

---

## Tipos de Elementos

### Rectangle / Ellipse / Diamond

```ts
{
  type: "rectangle" | "ellipse" | "diamond"
  x: number         // obrigatório
  y: number         // obrigatório
  width?: number    // calculado automaticamente se omitido (com label)
  height?: number   // calculado automaticamente se omitido (com label)
  label?: {
    text: string
    fontSize?: number
    fontFamily?: number
    strokeColor?: string
    textAlign?: "left" | "center" | "right"
    verticalAlign?: "top" | "middle" | "bottom"
  }
  roundness?: { type: 3 }  // type 3 = cantos arredondados
}
```

**Size guidelines:**

| Conteúdo | Width | Height |
|----------|-------|--------|
| 1 palavra | 120–150px | 60–80px |
| 2–4 palavras | 180–220px | 80–100px |
| Frase | 250–300px | 100–120px |

Diamond precisa ~20-40px a mais que rectangle para o mesmo texto.

---

### Text

```ts
{
  type: "text"
  x: number       // obrigatório
  y: number       // obrigatório
  text: string    // obrigatório
  fontSize?: number
  fontFamily?: number
  strokeColor?: string   // CRÍTICO: é a cor do texto. Sempre definir explicitamente.
  textAlign?: "left" | "center" | "right"
  verticalAlign?: "top" | "middle" | "bottom"
  containerId?: string   // se bound a um shape
  // NÃO fornecer width/height — calculados automaticamente
}
```

**Font sizes por hierarquia:**

| Nível | Tamanho |
|-------|---------|
| Título principal | 28–36px |
| Header de seção | 24–28px |
| Label de elemento | 18–22px |
| Anotação | 14–16px |
| Nota pequena | 12–14px |

**Font families:**

| ID | Nome | Uso |
|----|------|-----|
| 1 | Virgil | Hand-drawn, casual |
| 2 | Helvetica | Profissional, técnico |
| 3 | Cascadia | Código, monospace |
| 5 | Excalifont | Default recomendado |

---

### Arrow

```ts
{
  type: "arrow"
  x: number    // obrigatório
  y: number    // obrigatório
  width?: number   // default 100
  height?: number  // default 0
  // NÃO fornecer points — gerado automaticamente
  startArrowhead?: Arrowhead | null
  endArrowhead?: Arrowhead | null   // default "arrow"
  elbowed?: boolean                 // arrow em cotovelo (L-shape)
  label?: { text: string }
  // Binding por type (cria automaticamente):
  start?: { type: "rectangle" | "ellipse" | "diamond" | "text", text?: string }
  end?: { type: "rectangle" | "ellipse" | "diamond" | "text", text?: string }
  // Binding por id (liga a elemento existente):
  start?: { id: string }
  end?: { id: string }
}
```

**Arrowhead options:**
`"arrow"` | `"bar"` | `"circle"` | `"circle_outline"` | `"triangle"` | `"triangle_outline"` | `"diamond"` | `"diamond_outline"` | `"crowfoot_one"` | `"crowfoot_many"` | `"crowfoot_one_or_many"`

**Arrow styles semânticos:**

| Style | strokeStyle | Uso |
|-------|-------------|-----|
| Fluxo principal | `"solid"` | Conexões padrão |
| Resposta / async | `"dashed"` | Callbacks, retornos |
| Opcional / fraco | `"dotted"` | Dependências fracas |

---

### Line

```ts
{
  type: "line"
  x: number
  y: number
  width?: number   // default 100
  height?: number  // default 0
  // NÃO suporta start/end binding
  // points sempre gerado pelo sistema
}
```

---

### Frame

```ts
{
  type: "frame"
  children: string[]   // lista de IDs dos elementos filhos — OBRIGATÓRIO
  name?: string
  // x, y, width, height calculados automaticamente a partir dos children
}
```

---

## Binding Bidirecional (obrigatório)

Arrow e shapes precisam se referenciar mutuamente:

```ts
// Shape
{
  id: "api-gateway",
  boundElements: [{ id: "arrow-gw-to-auth", type: "arrow" }]
}

// Arrow
{
  id: "arrow-gw-to-auth",
  startBinding: { elementId: "api-gateway", focus: 0, gap: 5 },
  endBinding: { elementId: "auth-service", focus: 0, gap: 5 }
}

// Shape destino
{
  id: "auth-service",
  boundElements: [{ id: "arrow-gw-to-auth", type: "arrow" }]
}
```

`focus`: -1 a 1, posição ao longo da aresta. `gap`: distância da ponta ao elemento.

---

## Text Containment (bidirecional)

```ts
// Shape container
{
  id: "rect-1",
  boundElements: [{ id: "label-1", type: "text" }]
}

// Text bound
{
  id: "label-1",
  type: "text",
  containerId: "rect-1",
  strokeColor: "#334155"   // SEMPRE definir — é a cor do texto
}
```

---

## Fórmulas de Tamanho

```ts
// Width de texto
const width = Math.max(160, charCount * 9)       // Latin
const width = Math.max(160, charCount * 18)      // CJK

// Height
const height = 60   // single-line
const height = 60 + (lines - 1) * 24            // multi-line

// Aproximação alternativa
const width  = text.length * fontSize * 0.6
const height = fontSize * 1.2 * numberOfLines
```

---

## Algoritmo de Otimização de Arrows

Quando arrow tem binding por `id`, recalcular `x`, `y`, `width`, `height` para conectar nas arestas corretas:

```ts
function optimizeArrow(arrow, startEle, endEle) {
  const { startEdge, endEdge } = determineEdges(startEle, endEle)
  const startPoint = getEdgeCenter(startEle, startEdge)
  const endPoint   = getEdgeCenter(endEle, endEdge)

  arrow.x      = startPoint.x
  arrow.y      = startPoint.y
  arrow.width  = endPoint.x - startPoint.x
  arrow.height = endPoint.y - startPoint.y

  // Bug fix do Excalidraw
  if (arrow.width === 0) arrow.width = 1
}

function getEdgeCenter(element, edge) {
  switch (edge) {
    case "left":   return { x: element.x,                    y: element.y + element.height / 2 }
    case "right":  return { x: element.x + element.width,    y: element.y + element.height / 2 }
    case "top":    return { x: element.x + element.width / 2, y: element.y }
    case "bottom": return { x: element.x + element.width / 2, y: element.y + element.height }
  }
}

function determineEdges(startEle, endEle) {
  const dx = (startEle.x + startEle.width / 2) - (endEle.x + endEle.width / 2)
  const dy = (startEle.y + startEle.height / 2) - (endEle.y + endEle.height / 2)

  const L2R = startEle.x - (endEle.x + endEle.width)
  const R2L = -((startEle.x + startEle.width) - endEle.x)
  const T2B = startEle.y - (endEle.y + endEle.height)
  const B2T = -((startEle.y + startEle.height) - endEle.y)

  if (dx > 0 && dy > 0) return L2R > T2B ? { startEdge: "left",   endEdge: "right"  } : { startEdge: "top",    endEdge: "bottom" }
  if (dx < 0 && dy > 0) return R2L > T2B ? { startEdge: "right",  endEdge: "left"   } : { startEdge: "top",    endEdge: "bottom" }
  if (dx > 0 && dy < 0) return L2R > B2T ? { startEdge: "left",   endEdge: "right"  } : { startEdge: "bottom", endEdge: "top"    }
  if (dx < 0 && dy < 0) return R2L > B2T ? { startEdge: "right",  endEdge: "left"   } : { startEdge: "bottom", endEdge: "top"    }
  if (dx === 0 && dy > 0) return { startEdge: "top",    endEdge: "bottom" }
  if (dx === 0 && dy < 0) return { startEdge: "bottom", endEdge: "top"    }
  if (dx > 0 && dy === 0) return { startEdge: "left",   endEdge: "right"  }
  if (dx < 0 && dy === 0) return { startEdge: "right",  endEdge: "left"   }
  return { startEdge: "right", endEdge: "left" }  // overlap
}
```

---

## Algoritmos de Layout

### Grid (relationship diagrams)

```ts
const columns = Math.ceil(Math.sqrt(elementCount))
const x = startX + (index % columns) * horizontalGap
const y = startY + Math.floor(index / columns) * verticalGap
```

### Radial (mindmap)

```ts
const angle = (2 * Math.PI * index) / branchCount
const x = centerX + radius * Math.cos(angle)
const y = centerY + radius * Math.sin(angle)
```

---

## Espaçamentos Recomendados

| Contexto | Valor |
|----------|-------|
| Gap horizontal entre elementos | 200–300px |
| Gap vertical entre linhas | 100–150px |
| Gap entre elementos com arrow com label | 150–200px |
| Gap entre elementos sem label | 100–120px |
| Margem mínima das bordas | 50px |
| Padding interno de container/zone | 50–60px |
| Gap mínimo entre qualquer elemento | 40px |

---

## Paleta de Cores Semântica

| Categoria | Fill | Stroke |
|-----------|------|--------|
| Primary / Input | `#dbeafe` | `#1e40af` |
| Success / Data | `#dcfce7` | `#166534` |
| Warning / Decision | `#fef9c3` | `#854d0e` |
| Error / Critical | `#fee2e2` | `#991b1b` |
| External / Storage | `#f3e8ff` | `#6b21a8` |
| Process / Default | `#e0f2fe` | `#0369a1` |
| Trigger / Start | `#fed7aa` | `#c2410c` |
| Neutral / Container | `#f1f5f9` | `#475569` |

**Cores de texto:**

| Nível | Cor |
|-------|-----|
| Título | `#1e293b` |
| Label | `#334155` |
| Descrição | `#64748b` |

**Cores comuns:**

| Nome | Hex |
|------|-----|
| Default stroke | `#1e1e1e` |
| Light blue | `#a5d8ff` |
| Light green | `#b2f2bb` |
| Yellow | `#ffd43b` |
| Light red | `#ffc9c9` |

---

## Anti-Patterns Críticos

### 1. Texto em background rectangles
**Errado:** colocar `label.text` em retângulo de zona/container — o texto fica centralizado no meio, sobrepondo tudo dentro.

**Correto:** usar `text` element solto no topo da zona.

```ts
// ERRADO
{ type: "rectangle", width: 800, height: 400, label: { text: "VPC" } }

// CORRETO
{ type: "rectangle", width: 800, height: 400 }
{ type: "text", x: zone.x + 20, y: zone.y + 10, text: "VPC", fontSize: 18 }
```

### 2. `boundElements: []`
Sempre usar `null` quando vazio, nunca `[]`.

### 3. `strokeColor` em text omitido
Texto pode ficar invisível se `strokeColor` não for definido explicitamente.

### 4. Arrow `width === 0`
Bug do Excalidraw — arrow com `width === 0` não renderiza. Corrigir para `1`.

### 5. Cross-zone arrows em diagramas complexos
Arrows diagonais cruzando zonas criam spaghetti. Usar arrows elbowed com waypoints ao longo do perímetro.

### 6. Arrow labels em diagramas densos
Labels ficam no midpoint do arrow e sobrepõem elementos próximos. Usar apenas quando essencial, máximo 12 caracteres.

---

## Limites Práticos

| Contexto | Recomendado | Máximo |
|----------|-------------|--------|
| Elementos por diagrama | < 15 | 20 |
| Steps em flowchart | 3–10 | 15 |
| Entidades em relationship | 3–8 | 12 |
| Branches em mindmap | 4–6 | 8 |
| Sub-tópicos por branch | 2–4 | 6 |

---

## IDs

```ts
// Timestamp-based
const id = Date.now().toString(36) + Math.random().toString(36).slice(2)

// Descritivo (preferido)
const id = "api-gateway"
const id = "arrow-gw-to-auth"

// Seeds por seção (evitar colisão)
// Seção 1: 100001, 100002...
// Seção 2: 200001, 200002...
```

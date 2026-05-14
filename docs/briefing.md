# Briefing do Projeto

## O que é

SaaS de criação de apresentações com IA. O usuário fornece um tema e a plataforma gera automaticamente os slides — com conteúdo estruturado, diagramas e layouts visuais — usando Excalidraw como engine de renderização.

---

## Fluxo principal

```
Usuário fornece um tema
    ↓
outline-workflow (IA)
Gera a estrutura da apresentação: lista de outlines com tipo, título,
descrição, conceitos, representação e intenção de layout para cada slide.
    ↓
Usuário revisa e edita os outlines
    ↓
slide-workflow (IA)
Para cada outline, gera a SlideComposition — a especificação semântica
do slide: qual estrutura usar, quais elementos, quais relações.
    ↓
lib/excalidraw pipeline
composeLayout → normalizeArrows → serializeSkeleton
Traduz a SlideComposition em elementos visuais do Excalidraw.
    ↓
Editor de slides
O usuário visualiza, edita e ajusta os slides gerados.
    ↓
Modo apresentação
```

---

## Conceitos centrais

**Outline**
Especificação de um slide antes de ser gerado visualmente. Contém:
- `type` — papel do slide na apresentação (cover, agenda, content, summary, closing)
- `title` — título do slide
- `description` — descrição do conteúdo esperado
- `concepts[]` — conceitos-chave que devem aparecer
- `representation` — tipo de diagrama sugerido (flowchart, mindmap, orgchart, etc.)
- `layout` — descrição livre da intenção visual (texto gerado pela IA)

**SlideComposition**
O que a IA gera a partir de um outline. Union discriminada por `kind`:
`title_only | bullets | title_content | two_column | image_text | full_image | blank`

A composição é armazenada em `SLIDE.composition` antes de passar pelo pipeline visual, permitindo regeneração sem chamar a IA novamente.

**lib/excalidraw pipeline**
Camada de processamento que transforma `SlideComposition` em elementos visuais.
A IA não gera coordenadas — o pipeline calcula toda a geometria.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js (App Router) |
| Runtime | Bun |
| Banco de dados | Drizzle ORM + PostgreSQL |
| UI | shadcn/ui |
| IA / Workflows | Mastra |
| Modelo de IA | Gemini 2.5 Flash |
| Engine visual | Excalidraw (`@excalidraw/excalidraw`) |

---

## Rotas principais

| Rota | Função |
|------|--------|
| `/app/presentations/new` | Criar apresentação — dispara o outline-workflow |
| `/app/presentations/[id]/outline` | Revisar e editar os outlines gerados |
| `/app/presentations/[id]/editor` | Editor visual dos slides |
| `/app/presentations/[id]/present` | Modo apresentação |

---

## API

`POST /api/v1/app/presentations/generate` — recebe `{ topic }`, executa os workflows de geração.

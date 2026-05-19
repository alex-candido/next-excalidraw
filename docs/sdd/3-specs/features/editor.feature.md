# Feature: Editor

Página `/presentations/[id]/editor` — edição dos slides no canvas Excalidraw.

## Entrada

- `presentationId` via path param
- Slides já persistidos no banco após `slideWorkflow` (ver `slide-generation-flow.md`)
- Cada slide contém `elements: ExcalidrawElementSkeleton[]` (brutos) + `app_state`

## Estado da página

```
loading       → buscando presentation + slides
error         → presentation não encontrada ou sem slides (redireciona para outline)
ready         → slides carregados, canvas ativo no primeiro slide
```

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Toolbar (fixo, topo): título da apresentação | salvar | present │
├──────────────────┬───────────────────────────────────────────────┤
│  SlideList       │  Canvas (Excalidraw)                          │
│  (sidebar)       │                                               │
│                  │  slide atual em foco via scrollToContent()    │
│  thumbnail       │                                               │
│  + número        │                                               │
│  de cada slide   │                                               │
│                  │                                               │
└──────────────────┴───────────────────────────────────────────────┘
```

## Carregamento dos slides

```
server component:
  → busca presentation + slides ordenados por order
  → passa slides como prop para o client component

client component (ExcalidrawEditor):
  → converte skeletons → ExcalidrawElements via convertToExcalidrawElements()
     (client-side only — ver excalidraw-flow.md)
  → inicializa canvas com o primeiro slide
  → foca no slide via excalidrawAPI.scrollToContent(elements, { fitToViewport: true })
```

## Navegação entre slides

- Clique no SlideList → troca o slide ativo no canvas
- Ao trocar de slide:
  1. salva estado atual: `excalidrawAPI.getSceneElements()` → atualiza slide no estado local
  2. carrega elementos do novo slide no canvas

## Salvamento

- "Salvar" → PATCH /api/v1/app/presentations/[id]/slides (bulk update de elements por slideId)
- Sem auto-save nesta etapa — salvar é sempre explícito

## Templates (Ciclo 3)

Permite criar um novo slide sem passar pelo outline, a partir de um template pré-montado.

```
Botão "+" no SlideList → abre modal de templates
  └─ categorias: cover, content (flowchart, mindmap, timeline, etc.), summary, closing
  └─ template selecionado → instanciado como ExcalidrawElementSkeleton[] pré-montado
  └─ slide inserido na posição desejada
```

> Templates ficam em `lib/excalidraw/templates/` — ver `docs/reports/references-analysis.md` seção 6.4.

## Chat de Edição (Ciclo 3)

Painel lateral com chat interativo para editar slides via linguagem natural.

```
Painel de chat (sidebar direita)
  └─ usuário descreve a edição
  └─ agent tools: edit_slide, regenerate_slide, create_slide, delete_slide, apply_theme
  └─ preview da edição antes de confirmar
  └─ confirmação → atualiza canvas
```

> Referência: `presentation-ai/src/ai/agents/presentation/createAgent.ts` (ver `docs/reports/references-analysis.md` seção 6.1).

## Pontos de atenção

- `convertToExcalidrawElements` é client-side only — nunca chamar no servidor
- Canvas deve ser inicializado com `aspectRatio` da Presentation para delimitar o slide boundary
- `ExcalidrawEditor` já existe em `src/components/excalidraw/excalidraw-editor.tsx` — estender, não substituir
- Decisão pendente: **frames vs slides separados** — resolver antes de implementar (ver `docs/adr.md` ADR-004)
- Referência de UI: `inscribed/Canvas.tsx` (ver `docs/reports/references-analysis.md`)

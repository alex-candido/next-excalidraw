# Feature: Outline Page

Página `/presentations/[id]/outline` — revisão dos outlines gerados antes de disparar a geração dos slides.

## Entrada

- `presentationId` via path param
- Outlines já persistidos no banco após `outlineWorkflow` (ver `outline-generation-flow.md`)

## Estado da página

```
loading       → buscando presentation + outlines via server component
error         → presentation não encontrada ou não pertence ao usuário (404 / 403)
ready         → outlines carregados, aguardando confirmação do usuário
generating    → slideWorkflow em execução para cada outline
```

## Layout

```
┌──────────────────────────────────────────────────┐
│  Header: título da apresentação + botão "Gerar"  │
├──────────────────────────────────────────────────┤
│  Lista de OutlineCards (ordem definida por order)│
│                                                  │
│  OutlineCard:                                    │
│    badge: type (cover / agenda / content / ...)  │
│    título (editável)                             │
│    description (editável)                        │
│    representation (select, editável)             │
│    concepts (tags, somente leitura)              │
└──────────────────────────────────────────────────┘
```

## Interações

### Edição inline

- `title`, `description` e `representation` de cada outline são editáveis antes de confirmar
- Edições são locais (estado React) — não persistem via API até confirmação
- `type` e `concepts` não são editáveis pelo usuário nesta etapa

### Confirmação e geração de slides

Ao clicar em "Gerar":

```
1. Valida que ao menos 1 outline está presente
2. Persiste edições locais → PATCH /api/v1/app/presentations/[id]/outlines (bulk update)
3. Dispara POST /api/v1/app/presentations/[id]/slides/generate
   com lista de outlines atualizada
4. Exibe loading state com progresso (N de M slides gerados)
5. Redirect → /presentations/[id]/editor
```

> Ver `presentation-creation-flow.md` para o contrato da API de geração de slides.

## Regeneração individual de outline (P2)

Permite ao usuário regenerar apenas um outline sem reprocessar toda a apresentação.

```
Botão "Regenerar" no OutlineCard
  └─ POST /api/v1/app/outlines/[id]/regenerate
       { userPrompt, language, type, position }
       └─ substitui o outline no estado local
            └─ usuário pode confirmar e gerar os slides
```

> A abordagem de implementação (step dedicado vs reuso do `outlineWorkflow` com slideCount=1) ainda está em aberto — ver `docs/adr.md` → Decisões abertas.

## Pontos de atenção

- Página é server component — outlines são carregados no servidor, sem fetch client-side inicial
- Edições locais (não salvas) são enviadas junto na confirmação — não há auto-save
- `representation` editável deve respeitar as restrições por `type` (ex: `cover` só aceita `auto` ou `infographic`)
- Estado `generating` deve ser visível e informativo — geração pode levar 10–30s por slide
- Controle de densidade de elementos (P2): parâmetro `density: "light" | "medium" | "rich"` passado ao `slideWorkflow` na confirmação

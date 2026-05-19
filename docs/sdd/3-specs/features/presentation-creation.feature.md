# Feature: Presentation Creation

Cobre o ciclo completo de criação de uma apresentação — da submissão do formulário até o editor. Os detalhes dos workflows AI estão documentados em `outline-generation-flow.md` e `slide-generation-flow.md`.

## Visão geral

```
/presentations/new (form)
        │
        ▼
POST /api/v1/app/presentations                        → cria Presentation + gera outline
        │
        ▼
/presentations/[id]/outline (UI)                      → revisão e confirmação dos outlines
        │
        ▼
POST /api/v1/app/presentations/[id]/slides/generate   → gera slides para cada outline
        │
        ▼
/presentations/[id]/editor                            → canvas Excalidraw por slide
```

---

## Etapa 1 — Criação da Presentation + Geração do Outline

### Entrada

`POST /api/v1/app/presentations`

```ts
{
  userPrompt:  string     // min 1 char
  language:    number     // 0–9, default 0 (en)
  aspectRatio: number     // 0–5, default 0 (16:9)
  slideCount:  number     // 0 = automático (5–9), ou número definido pelo usuário
  keywords:    string[]   // opcional
}
```

### Camadas

```
route.ts
  ├─ valida input com presentationCreateSchema (Zod)
  ├─ obtém userId da sessão (Better Auth)
  └─ delega para presentation-service.create()

presentation-service.create()
  ├─ presentation-repository.create()
  │    { userId, userPrompt, language, aspectRatio, slideCount, keywords,
  │      title: "", status: 0(draft), visibility: 1(private) }
  │
  ├─ generation-repository.create()
  │    { presentationId, type: 0(outline), status: 0(pending) }
  │
  ├─ try:
  │    ├─ outlineWorkflow.start()           → ver outline-generation-flow.md
  │    │    Persistência de Outline[] ocorre APÓS o workflow retornar —
  │    │    o workflow não acessa o banco; apenas retorna o resultado estruturado
  │    │
  │    ├─ outline-repository.createMany()
  │    │    Outline[] com resultado do workflow
  │    │
  │    ├─ presentation-repository.update()
  │    │    { title: <título vindo do outline>, status: 1(active) }
  │    │
  │    └─ generation-repository.update()
  │         { status: 2(completed), completedAt, usage, model }
  │
  └─ catch (qualquer erro):
       ├─ generation-repository.update()
       │    { status: 3(failed), completedAt }
       └─ Presentation permanece em status: 0(draft)
            → service lança erro → route retorna HTTP 500
```

### Saída da API

```ts
// HTTP 201
{
  presentationId: string
  title:          string
  outlines: {
    id:             string
    order:          number
    type:           number
    title:          string
    description:    string
    concepts:       string[]
    representation: number
    layout:         string
  }[]
}
```

> Em caso de falha do workflow → HTTP 500, `Generation { status: 3(failed) }`, Presentation permanece em `draft`.

### Redirect

Frontend redireciona para `/presentations/[id]/outline`.

---

## Etapa 2 — Geração de Slides

### Entrada

`POST /api/v1/app/presentations/[id]/slides/generate`

```ts
// Path param
presentationId: string

// Body — lista dos outlines a gerar (subset para regeneração parcial)
{
  outlines: {
    outlineId:      string
    type:           number
    title:          string
    description:    string
    concepts:       string[]
    representation: number
    layout:         string
  }[]
}
```

> `language` e `aspectRatio` são herdados da Presentation — o service busca via `presentation-repository.findById()`.

### Camadas

```
route.ts
  ├─ valida input com slideGenerateSchema (Zod)
  ├─ obtém userId da sessão
  └─ delega para slide-service.generate()

slide-service.generate()
  ├─ presentation-repository.findById(presentationId)
  │    valida que presentation.userId === userId (403 se não for)
  │
  └─ para cada outline (execução sequencial):
       ├─ generation-repository.create()
       │    { presentationId, type: 1(slide), status: 0(pending) }
       │
       ├─ try:
       │    ├─ slideWorkflow.start()
       │    │    O workflow não acessa o banco — retorna ExcalidrawElementSkeleton[].
       │    │    → ver slide-generation-flow.md para detalhes do step interno
       │    │
       │    ├─ slide-repository.create()
       │    │    { presentationId, outlineId, order, elements, app_state, files: {}, status: 0(active) }
       │    │
       │    └─ generation-repository.update()
       │         { status: 2(completed), completedAt, usage, model }
       │
       └─ catch (erro no slide individual):
            ├─ generation-repository.update() { status: 3(failed), completedAt }
            └─ slide NÃO é inserido; demais outlines continuam processando
```

### Saída da API

```ts
// HTTP 201
{
  presentationId: string
  slides: {
    id:        string
    order:     number
    outlineId: string
  }[]
}
```

> Em falha de um slide individual: generation fica `failed`, slide não é inserido, os demais continuam.

### Redirect

Frontend redireciona para `/presentations/[id]/editor`.

---

---

## Etapa 1.5 — Atualização de Outlines (bulk update)

Disparado antes da geração de slides, quando o usuário edita outlines na página `/presentations/[id]/outline`.

### Entrada

`PATCH /api/v1/app/presentations/[id]/outlines`

```ts
// Path param
presentationId: string

// Body
{
  outlines: {
    id:             string   // outlineId a atualizar
    title:          string
    description:    string
    representation: number   // deve respeitar restrições por type
  }[]
}
```

> Apenas `title`, `description` e `representation` são atualizáveis pelo usuário. `type`, `concepts`, `order` e `layout` são gerados pela AI e não são editáveis nesta etapa.

### Saída

```ts
// HTTP 200
{ updated: number }   // quantidade de outlines atualizados
```

---

## Etapa 1.6 — Regeneração de Outline Individual

Disparado pelo botão "Regenerar" em um `OutlineCard` específico na página `/presentations/[id]/outline`.

### Entrada

`POST /api/v1/app/outlines/[id]/regenerate`

```ts
// Path param
outlineId: string

// Body
{
  userPrompt: string   // prompt original da apresentação (contexto)
  language:   number
  type:       number   // tipo fixo do outline a regenerar (0–4)
  order:      number   // posição deste outline na sequência
}
```

> A abordagem de implementação (step dedicado vs reuso do `outlineWorkflow` com `slideCount=1`) está pendente — ver `docs/adr.md`.

### Camadas

```
route.ts
  └─ delega para outline-service.regenerate()

outline-service.regenerate()
  ├─ outline-repository.findById(outlineId)
  │    valida que outline.presentationId pertence ao userId (403 se não for)
  │
  ├─ try:
  │    ├─ outlineWorkflow.start({ userPrompt, language, slideCount: 1, ... })
  │    │    (ou step dedicado quando implementado)
  │    │
  │    └─ outline-repository.update(outlineId)
  │         { title, description, concepts, representation, layout }
  │
  └─ catch:
       → service lança erro → route retorna HTTP 500
```

### Saída

```ts
// HTTP 200
{
  id:             string
  order:          number
  type:           number
  title:          string
  description:    string
  concepts:       string[]
  representation: number
  layout:         string
}
```

---

## Pontos de atenção

- Toda rota verifica sessão — sem userId → 401
- `presentation.userId !== session.userId` → 403
- `language` e `aspectRatio` são salvos na Presentation mas só `language` é passado aos workflows
- O workflow não acessa o banco — persistência é sempre responsabilidade do service
- Geração de slides é **sequencial** — um por vez, na ordem do `outline.order`
- Suporte a regeneração parcial: body pode conter subset dos outlines (para refazer slides individuais)
- `title` da Presentation vem do outline, nunca do `userPrompt`
- Schemas Zod de input das rotas ficam em `src/schemas/app/` — nunca inline no `route.ts`

# Feature: Presentation Creation

Existem dois caminhos de criação:

- **AI-generated** (este documento) — prompt → outline → slides → studio
- **Manual** — modal com title + type → studio vazio. Ver `manual-creation.feature.md`

Cobre o ciclo completo do caminho AI — da submissão do formulário até o studio. Os detalhes dos workflows AI estão documentados em `pipeline/outline-generation.pipeline.md` e `pipeline/slide-generation.pipeline.md`.

## Visão geral

```
/app/dashboard (AppDashboardForm)
        │
        ▼
POST /api/v1/app/presentations                               → cria Presentation (draft)
        │
        ▼
POST /api/v1/app/presentations/[id]/outlines/generate        → gera outlines
        │
        ▼
/presentations/[id]/outline (UI)                             → revisão e edição dos outlines
        │
        ▼
POST /api/v1/app/presentations/[id]/slides/generate          → gera slides
        │
        ▼
/presentations/[id]/studio                                   → canvas Excalidraw por slide
```

---

## Etapa 1 — Criação da Presentation

### Componentes — `AppDashboardForm` (`components/app/dashboard/form/`)

```
app-dashboard-form.tsx           ← container (server) — engine-bar / body / controls-bar
  ├─ app-dashboard-form-engine.tsx     ← badge "Excalidraw" locked (server, estático)
  ├─ app-dashboard-form-options.tsx   ← toggle Multi/Single — MOCK, sem estado real (dois botões sem onClick efetivo)
  ├─ app-dashboard-form-input.tsx     ← Textarea do prompt — MOCK, sem value/onChange
  ├─ app-dashboard-form-actions.tsx   ← attach (mock) + Enviar — MOCK, `Link` hardcoded pra `/app/presentations/mock/outline`
  └─ app-dashboard-form-controls.tsx  ← selects slideCount/language/aspectRatio — MOCK, defaultValue="0" estático
```

Nenhum campo do form tem estado real hoje — é puramente visual. Pendente de integração: elevar o estado (prompt, type, slideCount, language, aspectRatio) pro `app-dashboard-form.tsx` (ou um provider, se precisar ser compartilhado com outro component), e trocar `AppDashboardFormActions`'s `Link` mock por `useAppPresentation().useCreate()` seguido de `useAppPresentation().useGenerateOutline()`, navegando pro `/presentations/[id]/outline` só depois da geração completar (ver Etapa 2).

Ver `manual-creation.feature.md` pro caminho alternativo sem AI (`AppDashboardNewModal`, mesmo módulo `components/app/dashboard/`).

### Entrada

`POST /api/v1/app/presentations`

```ts
{
  type:        number     // 0=single · 1=multi
  userPrompt:  string     // min 1 char
  language:    number     // 0–9, default 0 (en)
  aspectRatio: number     // 0–5, default 0 (16:9)
  slideCount:  number     // 0 = automático, ou número definido pelo usuário
  amount:      number     // 0=auto · 1=minimal · 2=concise · 3=detailed · 4=extensive, default 0
  audience:    number     // 0=general · 1=business · 2=investor · 3=teacher · 4=student, default 0
  scenario:    number     // 0=auto · 1=promotional · 2=teaching · 3=analytical · 4=report, default 0
  theme:       number     // índice do tema, default 0 (daktilo)
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
  └─ presentation-repository.create()
       { userId, type, userPrompt, language, aspectRatio, slideCount,
         amount, audience, scenario, theme, keywords,
         title: "", status: 0(draft), visibility: 1(private) }
```

### Saída da API

```ts
// HTTP 201
{
  presentationId: string
  type:           number
}
```

### Redirect

Frontend redireciona para `POST /presentations/[id]/outlines/generate`.

---

## Etapa 2 — Geração de Outlines

### Entrada

`POST /api/v1/app/presentations/[id]/outlines/generate`

```ts
// Path param
presentationId: string

// Body
{
  userPrompt:  string
  language:    number
  slideCount:  number
  keywords:    string[]   // opcional
}
```

### Camadas

```
route.ts
  ├─ valida input com outlineGenerateSchema (Zod)
  ├─ obtém userId da sessão
  └─ delega para outline-service.generate()

outline-service.generate()
  ├─ presentation-repository.findById(presentationId)
  │    valida que presentation.userId === userId (403 se não for)
  │
  ├─ generation-repository.create()
  │    { presentationId, type: 0(outline), status: 0(pending) }
  │
  ├─ try:
  │    ├─ outlineWorkflow.start()           → ver pipeline/outline-generation.pipeline.md
  │    │    o workflow não acessa o banco; retorna resultado estruturado
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
       ├─ generation-repository.update() { status: 3(failed), completedAt }
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
    type:           number   // 0=cover · 1=content · 2=closing
    title:          string
    description:    string
    concepts:       string[]
    representation: number
    layout:         string
  }[]
}
```

### Redirect

Frontend redireciona para `/presentations/[id]/outline`.

---

## Etapa 3 — Geração de Slides

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
       │    │    o workflow não acessa o banco — retorna ExcalidrawElementSkeleton[]
       │    │    → ver pipeline/slide-generation.pipeline.md
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

### Redirect

Frontend redireciona para `/presentations/[id]/studio`.

---

## Etapa 2.5 — Atualização de Outlines (bulk update)

Disparado quando o usuário edita outlines na página `/presentations/[id]/outline`.

### Entrada

`PATCH /api/v1/app/presentations/[id]/outlines`

```ts
{
  outlines: {
    id:             string   // outlineId a atualizar
    title:          string
    description:    string
    representation: number
  }[]
}
```

> Apenas `title`, `description` e `representation` são editáveis. `type`, `concepts`, `order` e `layout` são gerados pela AI e não são editáveis.

### Saída

```ts
// HTTP 200
{ updated: number }
```

---

## Etapa 2.6 — Regeneração de Outline Individual

Disparado pelo botão "Regenerar" em um `OutlineCard` na página `/presentations/[id]/outline`.

### Entrada

`POST /api/v1/app/presentations/[id]/outlines/[outlineId]/generate`

```ts
// Path params
presentationId: string
outlineId:      string

// Body
{
  userPrompt: string   // prompt original da apresentação (contexto)
  language:   number
  type:       number   // tipo fixo do outline a regenerar (0–2)
  order:      number   // posição deste outline na sequência
}
```

### Camadas

```
route.ts
  └─ delega para outline-service.regenerate()

outline-service.regenerate()
  ├─ presentation-repository.findById(presentationId)
  │    valida que presentation.userId === userId (403 se não for)
  │
  ├─ try:
  │    ├─ outlineWorkflow.start({ userPrompt, language, slideCount: 1 })
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
- Suporte a regeneração parcial: body pode conter subset dos outlines
- `title` da Presentation vem do outline, nunca do `userPrompt`
- Schemas Zod de input das rotas ficam em `src/schemas/app/` — nunca inline no `route.ts`
- `type=single` → slideCount forçado a 1, outline único

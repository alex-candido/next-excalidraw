# Contract: Presentations

Endpoints de gerenciamento de apresentações.

Base path: `/api/v1/app/presentations`

> Auth requerida em todos os endpoints — sem sessão válida → 401.

---

## POST /api/v1/app/presentations

Cria uma nova apresentação (status `draft`). Não dispara geração — use `POST /[id]/outlines/generate` em seguida.

### Request

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

### Response

```ts
// HTTP 201
{
  presentationId: string
  type:           number   // 0=single · 1=multi
}
```

### Erros

| Status | Condição |
|--------|----------|
| 400 | Input inválido (Zod) |
| 401 | Sem sessão |

---

## GET /api/v1/app/presentations

Lista as apresentações do usuário autenticado.

### Response

```ts
// HTTP 200
{
  presentations: {
    id:          string
    title:       string
    type:        number   // 0=single · 1=multi
    status:      number   // 0=draft · 1=active
    visibility:  number   // 0=private · 1=public
    aspectRatio: number
    createdAt:   string   // ISO 8601
    updatedAt:   string
  }[]
}
```

### Erros

| Status | Condição |
|--------|----------|
| 401 | Sem sessão |

---

## GET /api/v1/app/presentations/[id]

Retorna detalhes de uma apresentação com seus outlines.

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`  | string | presentationId |

### Response

```ts
// HTTP 200
{
  id:          string
  title:       string
  type:        number
  userPrompt:  string
  language:    number
  aspectRatio: number
  slideCount:  number
  status:      number
  visibility:  number
  createdAt:   string
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

### Erros

| Status | Condição |
|--------|----------|
| 401 | Sem sessão |
| 403 | `presentation.userId !== session.userId` |
| 404 | Presentation não encontrada |

---

## DELETE /api/v1/app/presentations/[id]

Soft-delete — muda `status` pra `trash (3)`, não remove a linha nem os dados associados (outlines, slides, generations). A exclusão definitiva acontece depois, via job de retenção (ainda não implementado).

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`  | string | presentationId |

### Response

```
HTTP 204 — No Content
```

### Erros

| Status | Condição |
|--------|----------|
| 401 | Sem sessão |
| 403 | `presentation.userId !== session.userId` |
| 404 | Presentation não encontrada |

---

## POST /api/v1/app/presentations/[id]/outlines/generate

Gera outlines para a apresentação via `outlineWorkflow`. Atualiza o `title` da Presentation e muda status para `active`.

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`  | string | presentationId |

### Request

```ts
{
  userPrompt:  string
  language:    number
  slideCount:  number
  keywords:    string[]   // opcional
}
```

### Response

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

### Erros

| Status | Condição |
|--------|----------|
| 400 | Input inválido (Zod) |
| 401 | Sem sessão |
| 403 | Presentation não pertence ao usuário |
| 404 | Presentation não encontrada |
| 500 | Falha no `outlineWorkflow` — Presentation permanece `draft`, Generation fica `failed` |

---

## PATCH /api/v1/app/presentations/[id]/outlines

Atualiza outlines em bulk. Apenas `title`, `description` e `representation` são editáveis — `type`, `concepts`, `order` e `layout` são gerados pela AI e não aceitos neste endpoint.

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`  | string | presentationId |

### Request

```ts
{
  outlines: {
    id:             string   // outlineId
    title:          string
    description:    string
    representation: number
  }[]
}
```

### Response

```ts
// HTTP 200
{ updated: number }
```

### Erros

| Status | Condição |
|--------|----------|
| 400 | Input inválido (Zod) |
| 401 | Sem sessão |
| 403 | Presentation não pertence ao usuário |
| 404 | Presentation não encontrada |

---

## POST /api/v1/app/presentations/[id]/slides/generate

Gera slides para os outlines fornecidos via `slideWorkflow`. Suporta geração parcial (subset de outlines). Execução sequencial por outline — falha em um slide não interrompe os demais.

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`  | string | presentationId |

### Request

```ts
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

> `language` e `aspectRatio` são herdados da Presentation — não devem ser enviados no body.

### Response

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

### Erros

| Status | Condição |
|--------|----------|
| 400 | Input inválido (Zod) |
| 401 | Sem sessão |
| 403 | Presentation não pertence ao usuário |
| 404 | Presentation não encontrada |
| 500 | Falha no workflow de um slide individual — slide não é inserido, demais continuam |

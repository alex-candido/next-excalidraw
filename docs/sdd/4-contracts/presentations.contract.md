# Contract: Presentations

Endpoints de gerenciamento de apresentações e geração de conteúdo.

Base path: `/api/v1/app/presentations`

> Auth requerida em todos os endpoints — sem sessão válida → 401.

---

## POST /api/v1/app/presentations

Cria uma nova apresentação e dispara geração do outline via `outlineWorkflow`.

### Request

```ts
{
  userPrompt:  string     // min 1 char
  language:    number     // 0–9, default 0 (en)
  aspectRatio: number     // 0–5, default 0 (16:9)
  slideCount:  number     // 0 = automático (5–9), ou número definido pelo usuário
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
    type:           number   // 0=cover · 1=agenda · 2=content · 3=summary · 4=closing
    title:          string
    description:    string
    concepts:       string[]
    representation: number   // 0=auto · 1=flowchart · 2=mindmap · ... (ver enum no schema)
    layout:         string
  }[]
}
```

### Erros

| Status | Condição |
|--------|----------|
| 400 | Input inválido (Zod) |
| 401 | Sem sessão |
| 500 | Falha no `outlineWorkflow` — Presentation permanece em `status: 0 (draft)`, Generation fica `status: 3 (failed)` |

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
    type:           number
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

Remove uma apresentação e todos os dados associados (outlines, slides, generations).

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

## PATCH /api/v1/app/presentations/[id]/outlines

Atualiza outlines em bulk antes da geração de slides. Disparado na página `/presentations/[id]/outline` ao confirmar edições.

Apenas `title`, `description` e `representation` são editáveis — `type`, `concepts`, `order` e `layout` são gerados pela AI e não aceitos neste endpoint.

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
{ updated: number }   // quantidade de outlines atualizados
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

Gera slides para os outlines fornecidos via `slideWorkflow`. Suporta geração parcial (subset de outlines) para regeneração individual.

Execução sequencial por outline, na ordem de `outline.order`. Falha em um slide não interrompe os demais.

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

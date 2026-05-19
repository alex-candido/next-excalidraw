# Contract: Slides

Endpoints de leitura, atualização e geração de slides de uma apresentação.

Base path: `/api/v1/app/presentations/[id]/slides`

> Auth requerida em todos os endpoints — sem sessão válida → 401.

---

## GET /api/v1/app/presentations/[id]/slides

Retorna os slides de uma apresentação, ordenados por `order`. Cada slide inclui os `ExcalidrawElementSkeleton[]` brutos — conversão para `ExcalidrawElement[]` é feita client-side via `convertToExcalidrawElements()`.

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`  | string | presentationId |

### Response

```ts
// HTTP 200
{
  slides: {
    id:        string
    order:     number
    outlineId: string
    elements:  ExcalidrawElementSkeleton[]
    appState:  object
    status:    number   // 0=active · 1=archived
  }[]
}
```

### Erros

| Status | Condição |
|--------|----------|
| 401 | Sem sessão |
| 403 | Presentation não pertence ao usuário |
| 404 | Presentation não encontrada |

---

## PATCH /api/v1/app/presentations/[id]/slides

Salva o estado atual dos slides após edição no editor. Bulk update — aceita um ou mais slides. Disparado pelo botão "Salvar" no editor (sem auto-save).

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`  | string | presentationId |

### Request

```ts
{
  slides: {
    id:       string                      // slideId
    elements: ExcalidrawElementSkeleton[]
    appState: object
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

## POST /api/v1/app/presentations/[id]/slides/[slideId]/generate

Regenera um slide individual via `slideWorkflow`, substituindo o conteúdo existente.

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`      | string | presentationId |
| `slideId` | string | slideId a regenerar |

### Request

```ts
{
  outlineId:      string
  type:           number
  title:          string
  description:    string
  concepts:       string[]
  representation: number
  layout:         string
}
```

> `language` e `aspectRatio` são herdados da Presentation.

### Response

```ts
// HTTP 200
{
  id:        string
  order:     number
  outlineId: string
}
```

### Erros

| Status | Condição |
|--------|----------|
| 400 | Input inválido (Zod) |
| 401 | Sem sessão |
| 403 | Presentation não pertence ao usuário |
| 404 | Presentation ou slide não encontrado |
| 500 | Falha no `slideWorkflow` |

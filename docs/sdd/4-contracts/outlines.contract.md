# Contract: Outlines

Endpoints de gerenciamento de outlines individuais.

Base path: `/api/v1/app/presentations/[id]/outlines`

> Auth requerida em todos os endpoints — sem sessão válida → 401.

---

## POST /api/v1/app/presentations/[id]/outlines/[outlineId]/generate

Regenera um outline individual sem reprocessar toda a apresentação. Disparado pelo botão "Regenerar" em um `OutlineCard` na página `/presentations/[id]/outline`.

### Path params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `id`        | string | presentationId |
| `outlineId` | string | outlineId      |

### Request

```ts
{
  userPrompt: string   // prompt original da apresentação (contexto)
  language:   number   // 0–9
  type:       number   // tipo fixo do outline a regenerar (0–2)
  order:      number   // posição deste outline na sequência
}
```

> `type` e `order` são fixos — o outline regenerado mantém a posição e o tipo do original.

### Response

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

### Erros

| Status | Condição |
|--------|----------|
| 400 | Input inválido (Zod) |
| 401 | Sem sessão |
| 403 | Presentation não pertence ao usuário |
| 404 | Presentation ou outline não encontrado |
| 500 | Falha no workflow de regeneração |

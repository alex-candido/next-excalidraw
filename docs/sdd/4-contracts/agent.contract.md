# Contract: Agent

Endpoint do agente de edição interativa via chat.

Base path: `/api/v1/app/agent`

> Auth requerida — sem sessão válida → 401.

---

## POST /api/v1/app/agent/chat

Envia uma mensagem ao agente de edição. Retorna resposta em streaming (Server-Sent Events ou chunked transfer). O agente decide internamente se executa uma tool call ou responde diretamente.

### Request

```ts
{
  messages: {
    role:    "user" | "assistant"
    content: string
  }[]                                      // histórico + nova mensagem do usuário

  currentSlide: {
    id:             string
    elements:       ExcalidrawElementSkeleton[]
    type:           number
    representation: number
  }

  allSlides: {
    id:    string
    order: number
    type:  number
  }[]                                      // metadados dos demais slides (sem elements)

  presentation: {
    id:          string
    title:       string
    language:    number
    aspectRatio: number
  }
}
```

> Histórico de mensagens é limitado às últimas N mensagens (trimming feito no backend).

### Response — Streaming

Chunks enviados em sequência:

```ts
// chunk de texto (resposta do agente)
{ type: "text", delta: string }

// chunk de tool call iniciada
{ type: "tool_start", tool: "edit_slide" | "regenerate_slide" | "create_slide" | "delete_slide" | "apply_theme" | "respond_to_user", slideId?: string }

// chunk de resultado da tool
{ type: "tool_result", preview: ExcalidrawElementSkeleton[] }

// chunk de finalização
{ type: "done" }
```

> Após `tool_result`: frontend exibe preview no canvas. Usuário deve confirmar ou rejeitar — a edição **não é persistida** automaticamente.

### Tools disponíveis no agente

| Tool | Efeito |
|------|--------|
| `edit_slide` | Altera elementos, cores ou posicionamento do slide |
| `regenerate_slide` | Regera os elementos do slide mantendo a posição |
| `create_slide` | Cria novo slide em posição específica |
| `delete_slide` | Remove slides |
| `apply_theme` | Aplica paleta de cores à apresentação |
| `respond_to_user` | Responde sem editar (clarificação, dúvidas) |

> Em Single mode: `create_slide` e `delete_slide` não são expostos ao agente.

### Persistência após confirmação

Após o usuário confirmar o preview:

```
PATCH /api/v1/app/presentations/[id]/slides
  → body: { slides: [{ id, elements, appState }] }
```

O endpoint de chat não persiste — a confirmação é responsabilidade do frontend.

### Erros

| Status | Condição |
|--------|----------|
| 400 | Input inválido (Zod) |
| 401 | Sem sessão |
| 403 | Presentation não pertence ao usuário |
| 500 | Falha no agente ou tool call |

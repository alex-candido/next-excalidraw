# Feature: Agent Chat

Chat de edição interativa disponível no editor (Multi e Single). Usuário descreve edições em linguagem natural; o agent executa via tools estruturadas.

> Implementação: Ciclo 3. Referência: `temp/presentation-ai/src/ai/agents/presentation/createAgent.ts`.

## Visão geral

```
Painel de chat (sidebar do editor)
  └─ usuário envia mensagem
        └─ agent recebe contexto: mensagem + slides atuais (serialized)
              └─ agent decide: tool call ou resposta direta
                    └─ tool executada → preview da edição
                          └─ usuário confirma → canvas atualizado
```

---

## Tools do agent de edição

| Tool | Input | Efeito |
|------|-------|--------|
| `edit_slide` | slideId(s), propriedades a alterar | Altera elementos, cores, posicionamento |
| `regenerate_slide` | slideId(s), instrução | Regera os elementos do slide mantendo a posição |
| `create_slide` | type, representation, afterSlideId | Cria novo slide em posição específica |
| `delete_slide` | slideId(s) | Remove slides |
| `apply_theme` | themeName | Aplica paleta de cores à apresentação |
| `respond_to_user` | message | Responde sem editar (clarificação, dúvidas) |

> Modelo baseado nas 8 tools do `presentation-ai`. Adaptado para operar sobre `ExcalidrawElementSkeleton[]` em vez de XML Plate.

---

## Contexto enviado ao agent

A cada mensagem, o frontend serializa o estado atual para o agent:

```ts
{
  messages:      ChatMessage[]           // histórico do chat
  currentSlide:  { id, elements[], type, representation }
  allSlides:     { id, order, type }[]   // metadados dos demais slides (sem elements completos)
  presentation:  { title, language, aspectRatio }
}
```

> Histórico limitado às últimas N mensagens para controlar o contexto (ref: `trimMessageHistory` do `presentation-ai`).

---

## Fluxo de streaming

```
1. Frontend envia mensagem → POST /api/v1/app/agent/chat
2. Backend cria run do agentWorkflow → streaming
3. Frontend recebe chunks:
   - texto em stream → exibe na mensagem do agent
   - tool call detectado → exibe "Editando slide X..."
4. Tool executada → preview da edição visível no canvas (não confirmado ainda)
5. Usuário confirma ou rejeita a edição
6. Se confirmado → PATCH /api/v1/app/presentations/[id]/slides (salva no banco)
```

---

## UI do chat

```
┌──────────────────────────────────────────────┐
│  Editor (canvas)        │  Chat (sidebar)    │
│                         │                    │
│                         │  [msg usuário]     │
│  ← preview da edição    │  [msg agent +      │
│    refletido no canvas  │   preview tool]    │
│                         │                    │
│                         │  [confirmar] [🗑️]  │
│                         │  ─────────────── │
│                         │  [input mensagem]  │
└──────────────────────────────────────────────┘
```

---

## Casos de uso esperados

- "Muda as cores do slide 3 para tons de azul"
- "Regenera o slide de timeline com mais detalhes"
- "Adiciona um slide de conclusão após o slide 5"
- "Remove os slides de agenda e fechamento"
- "Aplica um tema mais escuro em toda a apresentação"
- "Explica o que está no slide atual" → `respond_to_user` sem edição

---

## Pontos de atenção

- Preview não confirma — edição só persiste após confirmação explícita do usuário
- Agent deve ter acesso apenas aos slides da apresentação atual — sem cross-presentation
- Retry automático em falha de tool call (ref: `enforceStructuredToolCallsForLocalModels` do `presentation-ai`)
- Para Single mode: as tools `create_slide` e `delete_slide` não fazem sentido — agent recebe contexto de slide único

# Feature: Collaboration

Cobre grupos de trabalho e compartilhamento de apresentações entre usuários.

> Implementação: Ciclo 5. Este documento é o blueprint de design — não há código ainda.

## Modelo de permissão

O dono da apresentação é sempre `presentation.user_id` — não é uma role em `presentation_member`. Membros adicionais são registrados em `presentation_member` com role `viewer` ou `editor`.

| Quem | Identificado por | Pode visualizar | Pode editar | Pode compartilhar | Pode deletar |
|------|---|:---:|:---:|:---:|:---:|
| Dono (owner) | `presentation.user_id` | ✓ | ✓ | ✓ | ✓ |
| Editor | `presentation_member.role = 1` | ✓ | ✓ | — | — |
| Viewer | `presentation_member.role = 0` | ✓ | — | — | — |

> Schema: `presentation_member.role` — `0` viewer · `1` editor. Owner é determinado por `presentation.user_id`, não por um valor no `presentation_member`.

---

## Grupos de trabalho

Agrupa usuários para facilitar o compartilhamento recorrente entre os mesmos membros.

```
Grupo
  └─ membros (user_group)
  └─ permissões (group_permission)
  └─ ao compartilhar uma presentation com um grupo:
       todos os membros recebem a role definida para o grupo
```

> Tabelas `group`, `user_group`, `group_permission`, `permission` já existem no schema.

---

## Compartilhamento com link

```
Presentation { visibility: public }
  └─ link: /presentations/[id] (acesso público, somente leitura)
  └─ link com convite: /invite/[token] → aceitar → vira presentation_member com role viewer
```

---

## Colaboração em tempo real

Permite que múltiplos usuários editem a mesma apresentação simultaneamente.

### Abordagem (a decidir)

| Opção | Pros | Contras |
|-------|------|---------|
| Y.js + WebSocket | CRDT nativo, sem conflito, baixa latência | Requer servidor WS persistente |
| Polling | Simples de implementar | Latência alta, não é tempo real |
| Liveblocks / PartyKit | Hosted, sem infra adicional | Custo externo, vendor lock-in |

> Decisão pendente — ver `docs/adr.md` → Decisões abertas.

### Escopo mínimo de colaboração em tempo real

- Cursor de cada usuário visível no canvas
- Edições propagadas em < 200ms
- Indicador de quem está editando qual slide
- Resolução de conflito: último write vence (simplificado)

---

## Pontos de atenção

- Auth necessária para todos os fluxos de colaboração — implementar antes do Ciclo 5
- `visibility: public` já está no schema da Presentation — habilitar sem grandes mudanças
- Grupos são opcionais — compartilhamento por usuário individual deve funcionar sem grupos
- Convite por link requer tabela de tokens de convite (não existe ainda no schema)

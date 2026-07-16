# Product Management

Índice — o conteúdo grande vive em `pm/` (um arquivo por seção), pra esse arquivo não crescer sem limite.

- [`pm/decisions.md`](pm/decisions.md) — Decisões abertas (arquitetura/produto)
- [`pm/active.md`](pm/active.md) — Tarefas em andamento/concluídas do ciclo atual
- [`pm/backlog.md`](pm/backlog.md) — Backlog (não priorizado pro ciclo atual)
- [`pm/done.md`](pm/done.md) — Histórico de tarefas concluídas (ciclos anteriores)

## Como retomar o projeto

Ao iniciar uma nova sessão de desenvolvimento, oriente o agente com o seguinte prompt:

```
Leia os seguintes arquivos para entender o estado atual do projeto antes de começar:

1. docs/sdd/1-product/pm.md e docs/sdd/1-product/pm/ — ciclo atual, tarefas Active e decisões abertas
2. docs/sdd/2-architecture/conventions.md — estrutura de pastas e regras do projeto
3. docs/sdd/3-specs/features/ — comportamento esperado de cada feature
4. docs/sdd/3-specs/pipeline/ — internos dos workflows de IA
5. docs/sdd/5-references/analysis.reference.md — referências analisadas e o que aproveitar

Em seguida, me diga:
- Em qual ciclo estamos
- Quais tarefas estão em Active
- Quais decisões abertas ainda precisam ser resolvidas
- Qual é a próxima tarefa recomendada com base nas dependências

Aguarde minha confirmação antes de implementar qualquer coisa.
```

---

## Planejamento

### Ciclos

```
Ciclo 1 — Pipeline AI (concluído)
  Scaffold, outlineWorkflow, slideWorkflow, schemas, lib/excalidraw

Ciclo 2 — Integração & UI Base (atual)
  Fase 2a — Mapeamento de components: landing ✅ · auth ✅ · app ✅ (settings adiado pro final, junto do admin)
  Nota: não há rota /presentations/new — o form de criação está no /app/dashboard
  Fase 2b — Integração dinâmica, nesta ordem:
    1. landing · auth · app (atual) — API routes + .http, persistência no banco, páginas essenciais (new, outline, studio, present)
    2. Mapeamento de components do admin
    3. Integração dinâmica do admin
    4. Settings (app + admin) — mapeamento de components e integração juntos, por último

Ciclo 3 — Qualidade & Features
  Parallelism, retry, custo de tokens, modelo dinâmico, editor/present, agent chat, templates

Ciclo 4 — Infraestrutura & Monetização
  Temas e personalização, exportações, thumbnails, planos, billing, compartilhamento público

Ciclo 5 — Modalidades de Produto
  Single (diagrama único, digitalização de imagem), colaboração em tempo real, workgroups
```

### Modalidades de produto

```
Multi (atual)  — apresentação completa: outline → N slides
                 input: texto

Single         — diagrama único sem outline
                 subtipos:
                   - prompt → representação Excalidraw (flowchart, mindmap, etc.)
                   - imagem como referência → Excalidraw baseado no conteúdo visual
                   - foto de quadro branco / esboço → digitalização via vision model
```

### Dependências críticas

```
outline API route
  └─ persistir outline no banco
       └─ slide API route
            └─ persistir slides no banco
                 └─ /presentations/[id]/outline (UI)
                      └─ /presentations/[id]/studio (UI)
                           └─ /presentations/[id]/present (UI)
```

### Decisões abertas

Ver [`pm/decisions.md`](pm/decisions.md).

---

## Prioridades

| Label | Significado |
|-------|-------------|
| `P0`  | Bloqueante — impede avanço de outras tarefas |
| `P1`  | Alta — próximo a ser feito |
| `P2`  | Média — ciclo atual ou próximo |
| `P3`  | Baixa — backlog, sem urgência |

---

## Active

Ver [`pm/active.md`](pm/active.md).

## Backlog

Ver [`pm/backlog.md`](pm/backlog.md).

## Done

Ver [`pm/done.md`](pm/done.md).

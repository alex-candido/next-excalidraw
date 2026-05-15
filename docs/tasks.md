# Tasks

## Como retomar o projeto

Ao iniciar uma nova sessão de desenvolvimento, oriente o agente com o seguinte prompt:

```
Leia os seguintes arquivos para entender o estado atual do projeto antes de começar:

1. docs/tasks.md — kanban com prioridades, dependências e decisões abertas
2. docs/conventions.md — estrutura de pastas e regras do projeto
3. docs/flows/ — comportamento esperado de cada pipeline
4. docs/reports/references-analysis.md — referências analisadas e o que aproveitar

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
  Conectar workflows à API, persistência no banco, páginas essenciais

Ciclo 3 — Qualidade & Features
  Parallelism, retry, custo de tokens, modelo dinâmico, editor/present

Ciclo 4 — Infraestrutura & Monetização
  Exportações, thumbnails, planos, billing, apresentações públicas
```

### Dependências críticas

```
outline API route
  └─ persistir outline no banco
       └─ slide API route
            └─ persistir slides no banco
                 └─ /presentations/[id]/outline (UI)
                      └─ /presentations/[id]/editor (UI)
                           └─ /presentations/[id]/present (UI)
```

### Decisões abertas

- [ ] **Editor: frames vs slides separados** — `inscribed` usa frames do Excalidraw (um canvas, N frames). Alternativa: um array de elements por slide no banco. Decidir antes de implementar o editor.
- [ ] **Modelo dinâmico** — definir se a seleção é por workflow, por usuário ou por plano antes de implementar.
- [ ] **slide-creator-prompt v2** — validar output da v2 em sandbox antes de substituir a v1 como definitiva.

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
---

**Pipeline AI**
- [ ] `P1` Melhorar `slide-creator-prompt` — validar v2 em sandbox, substituir v1 como definitiva, adicionar tipos `class`, `er`, `gantt`, `fishbone`, `swot`, `funnel`
- [ ] `P1` Melhorar `outline-creator-prompt` — alinhar representações com os novos tipos adicionados

**Integração**
- [ ] `P0` Conectar `slideWorkflow` à API route — gerar slides após outline
- [ ] `P0` Persistir outline no banco após geração
- [ ] `P0` Persistir slides no banco após geração

---

## Backlog
---

**Pipeline AI**
- [ ] `P2` Geração de slides em paralelo (um por outline)
- [ ] `P2` Retry automático em falha de tool call
- [ ] `P2` Registrar `Generation` e `Log` durante a geração
- [ ] `P2` Calcular custo real de geração com base nos tokens consumidos (`metadata.usage`) — integrar tabela de preços por modelo
- [ ] `P3` Tornar o modelo dinâmico — suporte a múltiplos providers (Gemini, Anthropic, etc.) configurável por workflow ou por usuário
- [ ] `P3` Desenvolver `slide-composition` — próximo ciclo após conclusão dos fluxos atuais

**lib/excalidraw**
- [ ] `P2` `validateSkeletons` — adicionar validação de `strokeColor` em elementos `text`, fallback para `#1e1e1e` se ausente
- [ ] `P3` `parseSkeletons` — suporte a output com múltiplos blocos JSON separados (LLMs às vezes dividem em chunks)
- [ ] `P3` `element-sizing.ts` — funções utilitárias: `calcTextWidth` (com ajuste por idioma), `calcContainerHeight`, `snapToGrid` (grid de 20px)

**UI**
- [ ] `P1` Página `/presentations/new` — form com prompt, idioma, slideCount
- [ ] `P2` Página `/presentations/[id]/outline` — listagem e edição dos outlines
- [ ] `P2` Página `/presentations/[id]/editor` — editor Excalidraw por slide (ref: `inscribed/Canvas.tsx`)
- [ ] `P2` Página `/presentations/[id]/present` — modo apresentação fullscreen com `exportToImageUrls` (ref: `inscribed/PresentationMode.tsx`)
- [ ] `P2` Loading states durante geração

**Infraestrutura**
- [ ] `P3` Thumbnail gerado automaticamente após criação do slide
- [ ] `P3` Exportação PDF / PPT
- [ ] `P3` Apresentações públicas (visibility: public)

**Monetização**
- [ ] `P3` Integração de pagamento (Stripe)
- [ ] `P3` Planos com limites de geração
- [ ] `P3` Billing e histórico de uso

---

## Done
---

- [x] Scaffold completo — auth, i18n, DB schema, rotas, providers
- [x] `outlineWorkflow` funcional com tool call estruturada
- [x] `slideWorkflow` funcional com prompt dinâmico por tipo/representação
- [x] Schema Zod completo do Excalidraw
- [x] `normalizeArrows` — recálculo de coordenadas de setas vinculadas
- [x] `validateSkeletons` + `parseSkeletons` — parser robusto de output LLM
- [x] `skeleton-serializer` — integração com `convertToExcalidrawElements`
- [x] Sandbox de elementos Excalidraw (`/dev/sandbox`)
- [x] Documentação inicial — briefing, adr, tasks, config, diagrams
- [x] Schemas enriquecidos — `outlineId`/`order` no slide input, `REPRESENTATION_BY_TYPE`, validação com fallback
- [x] `buildWorkflowMetadata` — utilitário compartilhado em `lib/mastra/utils/`
- [x] Metadata tipada nos outputs de `outlineWorkflow` e `slideWorkflow`
- [x] Flows documentados — `outline-generation-flow.md`, `slide-generation-flow.md`, `excalidraw-flow.md`
- [x] `slide-creator-prompt.v2.ts` — reescrita com filosofia "argue not display", paleta semântica, container discipline, anti-patterns
- [x] Análise de repositórios de referência — `docs/reports/references-analysis.md`

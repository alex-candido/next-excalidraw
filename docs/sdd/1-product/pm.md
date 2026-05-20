# Product Management

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
  API routes + .http, persistência no banco, páginas essenciais (new, outline, editor, present)

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
                      └─ /presentations/[id]/editor (UI)
                           └─ /presentations/[id]/present (UI)
```

### Decisões abertas

- [ ] **Editor: frames vs slides separados** — `inscribed` usa frames do Excalidraw (um canvas, N frames). Alternativa: um array de elements por slide no banco. Decidir antes de implementar o editor.
- [ ] **Modelo dinâmico** — definir se a seleção é por workflow, por usuário ou por plano antes de implementar.
- [ ] **slide-creator-prompt v2** — validar output da v2 em sandbox antes de substituir a v1 como definitiva.
- [ ] **Regeneração de outline individual** — novo step dedicado no workflow ou reuso do `outlineWorkflow` com `slideCount=1` e tipo fixo. Decidir antes de implementar a rota de regeneração.
- [ ] **Colaboração em tempo real** — avaliar Y.js + WebSocket vs solução baseada em polling. Decidir antes do Ciclo 5.
- [ ] **Single mode: workflow separado ou step condicional** — definir se Single terá seu próprio workflow ou usará o `slideWorkflow` com parâmetros diferenciados.

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
- [ ] `P2` Otimizar `slide-creator-prompt` — reduzir tokens, eliminar redundâncias, focar em regras de posicionamento programático; validar em sandbox antes de substituir
- [ ] `P1` Melhorar `outline-creator-prompt` — alinhar representações com os novos tipos adicionados

**Integração & API**
- [x] `P0` Criar API routes sem autenticação — `POST /presentations`, `POST /presentations/[id]/slides/generate`, `GET /presentations`, `GET /presentations/[id]`, `DELETE /presentations/[id]`, `PATCH /presentations/[id]/outlines`, `POST /presentations/[id]/outlines/[outlineId]/generate`, `GET /presentations/[id]/slides`, `PATCH /presentations/[id]/slides`, `POST /presentations/[id]/slides/[slideId]/generate`
- [x] `P0` Criar `.http` files para todas as rotas — `src/http/v1/app/presentations.http`, `outlines.http`, `slides.http`
- [x] `P0` Conectar `slideWorkflow` à API route — gerar slides após outline
- [x] `P0` Persistir outline no banco após geração
- [x] `P0` Persistir slides no banco após geração

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
- [x] `P2` `validateSkeletons` — adicionar validação de `strokeColor` em elementos `text`, fallback para `#1e1e1e` se ausente
- [ ] `P3` `parseSkeletons` — suporte a output com múltiplos blocos JSON separados (LLMs às vezes dividem em chunks)
- [ ] `P3` `element-sizing.ts` — funções utilitárias: `calcTextWidth` (com ajuste por idioma), `calcContainerHeight`, `snapToGrid` (grid de 20px)

**UI — Ciclo 2**
- [ ] `P1` Página `/presentations/new` — form com prompt, idioma, aspectRatio, slideCount, keywords
- [ ] `P2` Página `/presentations/[id]/outline` — listagem e edição dos outlines; botão de regenerar item individual (P2)
- [ ] `P2` Página `/presentations/[id]/editor` — editor Excalidraw por slide (ref: `inscribed/Canvas.tsx`)
- [ ] `P2` Página `/presentations/[id]/present` — modo apresentação fullscreen com `exportToImageUrls` (ref: `inscribed/PresentationMode.tsx`)
- [ ] `P2` Loading states durante geração (outline e slides)

**Pipeline AI — melhorias**
- [ ] `P2` Controle de densidade de elementos por slide — suporte a níveis light / medium / rich no prompt; expor como parâmetro no form
- [ ] `P2` Geração de slides em paralelo (um por outline)
- [ ] `P2` Retry automático em falha de tool call
- [ ] `P2` Registrar `Generation` e `Log` durante a geração
- [ ] `P2` Calcular custo real de geração com base nos tokens consumidos (`metadata.usage`) — integrar tabela de preços por modelo
- [ ] `P3` Tornar o modelo dinâmico — suporte a múltiplos providers (Gemini, Anthropic, etc.) configurável por workflow ou por usuário

**lib/excalidraw**
- [ ] `P3` `parseSkeletons` — suporte a output com múltiplos blocos JSON separados
- [ ] `P3` `element-sizing.ts` — funções utilitárias: `calcTextWidth` (ajuste por idioma), `calcContainerHeight`, `snapToGrid` (grid de 20px)

**Regeneração individual de outline**
- [ ] `P1` Definir abordagem: novo step dedicado vs reuso do `outlineWorkflow` com slideCount=1 (ver decisões abertas)
- [ ] `P2` Implementar rota `POST /api/v1/app/outlines/[id]/regenerate`
- [ ] `P2` Botão de regenerar por outline card na página `/presentations/[id]/outline`

**Chat de Edição (Agent) — Ciclo 3**
- [ ] `P2` Definir tools do agent de edição — baseado no modelo do `presentation-ai` (ref: `temp/presentation-ai/src/ai/agents/presentation/createAgent.ts`)
- [ ] `P2` Implementar agent com tools: `edit_slide`, `regenerate_slide`, `create_slide`, `delete_slide`, `apply_theme`, `respond_to_user`
- [ ] `P2` UI do chat — painel lateral com streaming de mensagens e preview de edições
- [ ] `P3` Sugestões contextuais — agent propõe edições com base no conteúdo atual do slide

**Templates no Editor — Ciclo 3**
- [ ] `P2` Definir biblioteca de templates — tipos: cover, agenda, content (flowchart, mindmap, timeline, etc.), summary, closing
- [ ] `P2` Criar slides a partir de template sem passar pelo outline
- [ ] `P3` Templates como `ExcalidrawElementSkeleton[]` pré-montados em `lib/excalidraw/templates/`

**Temas e Personalização — Ciclo 4**
- [ ] `P3` Definir estrutura do objeto de tema — paleta de cores semânticas (primary, accent, background, text, heading), tipografia, background
- [ ] `P3` Aplicar tema como `appState` no canvas Excalidraw (backgroundColor + element colors)
- [ ] `P3` Seletor de tema na UI — galeria de temas pré-definidos (ref: `presentation-ai/themes.ts`)
- [ ] `P3` Customização de background por slide

**Colaboração & Workgroups — Ciclo 5**
- [ ] `P3` Definir modelo de permissão — owner, editor, viewer por presentation
- [ ] `P3` Grupos de trabalho — tabelas `group`, `user_group` já existem no schema; implementar UI e lógica
- [ ] `P3` Compartilhamento com link — `visibility: public` + link de acesso direto
- [ ] `P3` Colaboração em tempo real — avaliar Y.js + WebSocket vs polling (ver decisões abertas)

**Modalidades — Ciclo 5**
- [ ] `P3` Modalidade **Single: prompt → diagrama** — workflow simplificado sem outline; tipo e representação definidos pelo usuário
- [ ] `P3` Modalidade **Single: imagem → Excalidraw** — upload de imagem como referência; vision model gera skeleton baseado no conteúdo visual
- [ ] `P3` Modalidade **Single: foto de quadro branco → digitalização** — vision model lê anotações e gera ilustração Excalidraw fiel
- [ ] `P3` Modalidade **Multi** — renomear fluxo atual para "multi" explicitamente na UI/rotas
- [ ] `P3` Visualização versátil no Single — modos: editor, fullscreen, embed (iframe exportável)

**Infraestrutura — Ciclo 4**
- [ ] `P3` Thumbnail gerado automaticamente após criação do slide
- [ ] `P3` Exportação PDF / PPT (ref: `presentation-ai/domToPptxConverter.ts` — client-side via PptxGenJS)
- [ ] `P3` Apresentações públicas (visibility: public)

**Custos & Estimativas**
- [ ] `P3` Analisar tokens consumidos por workflow — medir outline + slide em diferentes cenários
- [ ] `P3` Modelo de estimativa de custo por plano — ex: 100 usuários × N apresentações/mês × custo médio por geração
- [ ] `P3` Definir tiers de plano com base nas estimativas

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
- [x] Flows de integração documentados — `presentation-creation-flow.md`, `outline-page-flow.md`, `editor-flow.md`, `present-flow.md`
- [x] `slide-creator-prompt.v2.ts` — reescrita com filosofia "argue not display", paleta semântica, container discipline, anti-patterns
- [x] Análise de repositórios de referência — `docs/reports/references-analysis.md`
- [x] Workflow sandbox (`/dev/sandbox/workflow`) — teste visual de `outlineWorkflow` e `slideWorkflow` com ExcalidrawEditor integrado
- [x] `slide-creator-prompt` — regras de posicionamento: `textAlign:center` usa x como centro, `{{CENTER_X}}`/`{{CENTER_Y}}` como âncoras, proibição de markdown, limites de largura de texto, padding de contêineres
- [x] `slide-boundary` — retângulo de delimitação dinâmico por `aspectRatio`, centralizado via `scrollToContent` no sandbox

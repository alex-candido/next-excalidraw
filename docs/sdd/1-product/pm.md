# Product Management

## Como retomar o projeto

Ao iniciar uma nova sessão de desenvolvimento, oriente o agente com o seguinte prompt:

```
Leia os seguintes arquivos para entender o estado atual do projeto antes de começar:

1. docs/sdd/1-product/pm.md — ciclo atual, tarefas Active e decisões abertas
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

- [x] **Editor: frames vs slides separados** — decidido: slides separados por entidade. Cada slide tem seu próprio `elements: jsonb` no banco. Canvas recarregado ao navegar. Ver ADR-004.
- [ ] **Modelo dinâmico** — definir se a seleção é por workflow, por usuário ou por plano antes de implementar.
- [ ] **slide-creator-prompt v2** — validar output da v2 em sandbox antes de substituir a v1 como definitiva.
- [x] **Regeneração de outline individual** — decidido: reuso do `multiOutlineWorkflow` com `slideCount=1` e tipo fixo. Já implementado em `multiOutlineService().regenerate()`.
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

**Mapeamento de components — módulos UI** *(concluído para landing/auth/app — settings e admin ficam pro final, depois da integração dinâmica de app. Ver Ciclo 2/Fase 2b acima)*
*(Ordem: landing ✅ → auth ✅ → app ✅ (shell) → app (detail pages, outline ✅ · studio ✅ · present ✅) → ~~admin~~ (adiado) → ~~settings~~ (adiado))*

- [x] `P1` Landing module — mapeamento completo
- [x] `P1` Auth module — sign-in, sign-up, forgot-password, reset-password
- [x] `P2` App module — dashboard ✅ (inclui form de criação: engine · options · input · controls · actions)
- [x] `P2` App module — criação manual (+) — AppDashboardNewModal (engine · type · features · actions · título) · trigger no AppNavRail · trigger no AppDashboardRecentsHeader · trigger no AppPresentationsHeader
- [x] `P2` App module — presentations (list) — AppPresentationsHeader (trash toggle · badge count) · AppPresentationsToolbar · AppPresentationsTrashToolbar · AppPresentationCard (isFavorited · actions) · AppPresentationCardFavorite · AppPresentationTrashModal · AppPresentationsEmpty
- [x] `P3` App module — app/templates — AppTemplatesHeader · AppTemplatesToolbar · AppTemplateCard · AppTemplateCardActions · modals (preview, duplicate)
- [x] `P3` App module — app/community — AppCommunityHeader · AppCommunityToolbar · AppCommunityModal (duplicate view ↔ author view navigation) · AppCommunityModalDuplicateView · AppCommunityModalAuthorView
- [x] `P2` App module — presentations/[id]/outline — AppPresentationsOutlineHero (colapsa em prompt + controls-bar) · AppPresentationsOutlineList (drag reorder · delete · add manual) · AppPresentationsOutlineCard (regenerate) · AppPresentationsOutlineParameters (theme/amount em cards) · AppPresentationsOutlineBottomBar
- [x] `P2` App module — presentations/[id]/studio — AppStudioCanvas · AppStudioSlideList · AppStudioToolbar · AppStudioActions
- [x] `P2` App module — presentations/[id]/present — AppPresentationsPresentView (fullscreen, Escape/←/→ globais) · AppPresentationsPresentCanvas (Excalidraw view+zen mode, tamanho medido via `window.innerWidth/innerHeight`) · AppPresentationsPresentNav (pill flutuante única: sair · anterior/contador/próximo · tela cheia · tema)
- [ ] `P3` App module — settings/profile, settings/billing, settings/team *(adiado — só depois da integração dinâmica de app + mapeamento/integração do admin)*
- [ ] `P3` Admin module — dashboard, users, logs, settings *(adiado — mapeamento vem só depois da integração dinâmica de landing/auth/app)*

**UI — Ciclo 2 · Fase 2b (atual)** *(integração dinâmica de landing/auth/app — substituir mock state por fetch real, persistência no banco)*
- [x] `P1` Auth module — integração dinâmica completa (sign-in, sign-up, forgot-password, reset-password) — `useForm` (react-hook-form + zod) + `useAuth` (better-auth: email/password, Google OAuth, reset/forgot password) · Resend pra e-mails transacionais (ver ADR-009) · testado ponta a ponta (cadastro → e-mail de verificação → login automático → redirect pro dashboard)
- [ ] `P1` Testar manualmente todas as páginas de auth (sign-in, sign-up, forgot-password, reset-password) — cobrir estados de erro (credenciais inválidas, token expirado/inválido, e-mail duplicado)
- [x] `P2` Header do app e da landing — `UserMenu` compartilhado (`components/ui/user-menu.tsx`) — avatar · nome/e-mail · badge de grupo · upgrade to pro · billing/perfil/conta/notificações · sign-out. `LayoutNavUserMenu` (Layer 1) + `LandingHeaderAuthSlot` (exclusividade CTA↔UserMenu conforme sessão) · `LandingAppShortcut` (pill flutuante pro app quando logado)
- [x] `P2` User groups & permissions — `permission-repository.ts`/`permission-service.ts` (`server/repositories|services/auth/`) resolvem RBAC completo (default do grupo + overrides por usuário, deny sempre vence) · `customSession` (better-auth) popula `session.user.group` e `session.user.permissions` já resolvidos · `customSessionClient` no client pra inferência de tipos · `UserMenu` sem o cast temporário · `usePermissions()` (`hooks/use-permission.ts`) pronto pra gating de UI (fail-closed) — ver ADR-010
- [ ] `P2` Aplicar `hasPermission()` como guarda de autorização dentro dos services (antes da mutação) e `usePermissions()`/`hasPermission()` como gating de UI nas rotas/telas de app/admin — feito durante a integração dinâmica de cada módulo, não como etapa isolada
- [x] `P1` `actions/app/` (`app-presentation-actions.ts`, `app-outline-actions.ts`, `app-slide-actions.ts` + `actions/api-client.ts` — fetch wrapper compartilhado) e `hooks/app/` (`use-app-presentation.ts`, `use-app-outline.ts`, `use-app-slide.ts` — react-query) para as rotas `/api/v1/app/presentations/**` já existentes — mesmo padrão acoplado de `server/repositories`/`server/services` (`function xActions()/useAppX() {...; return {}}`, hooks filhos definidos dentro e retornados no final) — types de modelo/resultado vivem em `schemas/app/` (nunca inline nas actions) — pré-requisito pras páginas abaixo, ainda não consumido por nenhuma tela
- [x] `P2` Documentação de API navegável — `lib/openapi/document.ts` (zod-openapi, gera OpenAPI 3.1 a partir dos schemas de `schemas/app/` já existentes) servido em `/dev/openapi.json` e renderizado via Scalar em `/dev/api-docs` — ver ADR-011. Complementa (não substitui) os `.http`
- [x] `P1` Processamento em background (Inngest) — envelope `{status: "completed"|"pending"}` aplicado nas 4 rotas de generate/regenerate (`schemas/app/generation-schema.ts`); as 4 rotas (`outlines/generate`, `outlines/[id]/generate`, `slides/generate`, `slides/[id]/generate`) migradas de fato pro Inngest (`lib/inngest/functions/`), cada uma validada ponta a ponta via curl (202 instantâneo → job roda em background → resultado aparece em `GET /presentations/:id`/`GET /presentations/:id/slides`) — ver ADR-012. Dev requer `bun run dev:all` (Next.js + Inngest Dev Server juntos, via `concurrently`) + `INNGEST_DEV=1` no `.env.local`
- [ ] `P2` Endpoint de status de generation dedicado (`GET .../generations/:id`) — hoje o client só descobre que terminou dando poll em `GET /presentations/:id`
- [x] `P1` Renomeado `app/dashboard` → `app/start` (não é um dashboard, é a tela de criação/entrada do app) — rota, 19 componentes (`AppDashboard*` → `AppStart*`), provider, i18n (`app-dashboard.json` → `app-start.json`, namespace `app.start`) e todos os redirects (`roles-config.ts`, `use-auth.ts`, `auth-sign-in-form.tsx`, `landing-app-shortcut.tsx`, `app-nav-rail.tsx`)
- [x] `P1` `AppStartForm` (prompt + IA) wireado — novo `AppStartProvider` (`providers/app/app-start-provider.tsx`, sem "Form" no nome) cria a presentation (`useAppPresentation().useCreate()`), dispara `generateOutline` (chamada direta da action, não do hook — id só existe depois do create resolver) e navega pro `/presentations/[id]/outline`
- [x] `P1` `AppStartNewModal` (criação manual, sem IA) wireado — título com estado real, cria via `useCreate()` e navega direto pro `/studio` (sem outline). Exigiu abrir `userPrompt` no `presentationCreateSchema` (agora opcional) e aceitar `title` no create (antes gravava `""` fixo)
- [x] `P1` `AppPresentationsOutlineProvider` — trocado mock global por dados reais (`useParams()` + `useAppPresentation().useDetail(id)`), editar campos fica local até "Gerar" (persiste via bulk-update), regenerar individual/tudo agora é assíncrono (Inngest) — provider faz *poll* comparando `updatedAt` pra saber quando terminou. Delete/add/reorder de outline ficam só locais (sem persistência — gaps de backend conhecidos, ver Backlog)
- [x] `P2` `AppPresentationsStudioProvider` — mesmo tratamento do outline (dados reais via `useAppPresentation().useDetail(id)` + `useAppSlide().useList(id)`, poll enquanto espera geração inicial). Título de cada slide vem do outline correspondente via `outlineId` (`slide` não guarda título próprio). `onSave` persiste via `useAppSlide().useBulkUpdate()`, lendo os elements atuais direto da API do Excalidraw (não do estado). Add/duplicate/reorder/toggle-hidden de slide ficam só locais (mesmos gaps de backend do outline). Validado via curl (formato do skeleton/appState real bate com o `skeletonSerializer` já existente)
- [ ] `P2` Página `/presentations/[id]/present` — não precisa de trabalho, já lê do Studio
- [x] `P2` Listagem `/app/presentations` — novo `AppPresentationsListProvider` (`providers/app/app-presentations-list-provider.tsx`), busca real via `useAppPresentation().useList()` e separa ativos/trash client-side por `status` (a rota já retorna os dois juntos). `isTrashView`/`onTrashToggle` movidos do estado local do `AppPresentations` pro provider — `AppPresentationsHeader` deixou de receber isso via props, consome o provider direto. `AppPresentationsSearch` (Cmd-K) também usa dados reais agora
- [x] `P2` Trash/delete confirm — `AppPresentationTrashModal.onConfirm` conectado com `useAppPresentation().useMoveToTrash()` via `onMoveToTrash` do provider — validado ponta a ponta (`GET /presentations` já retorna a mistura ativos/trash certa)
- [ ] `P3` `AppStartRecents` (preview de recentes no `/app/start`) ainda usa array mock — agora que `useAppPresentationsList()` existe, dá pra reaproveitar direto (não fazia parte do pedido original, só ficou fácil depois desse passo)
- [ ] `P1` **`onSave` do Studio sobrescreve `slide.elements` com o formato errado (real `ExcalidrawElement[]`, não skeleton)** — achado ao investigar a bagunça de posicionamento reportada em todos os slides da presentation `a403cfa5-7150-4f0e-8518-fa2295ff65c8`. Inspecionando os dados reais no banco: `slide.elements` já contém elementos totalmente convertidos (`seed`, `versionNonce`, `index`, `boundElements`, `startBinding`/`endBinding` reais etc.), não o `ExcalidrawElementSkeleton` bruto que a IA gera (ADR-001 documenta a coluna como skeleton). Causa: `AppPresentationsStudioProvider.onSave()` (`src/providers/app/app-presentations-studio-provider.tsx`) pega `scene.elements` — já processado por `convertToExcalidrawElements` no client — e persiste direto via `bulkUpdate`, sobrescrevendo o skeleton original assim que o usuário salva. Na próxima hidratação, esse dado já-convertido passa de novo por `convertToExcalidrawElements` (2ª conversão), que não é garantidamente idempotente pra elementos vinculados — hipótese de causa raiz da bagunça reportada, mas ainda não confirmada com uma seta real do banco (consulta interrompida). Reverted (a pedido do usuário) as duas mitigações client-side tentadas (try/catch → canvas vazio; sanitização de tipo de `id`) para o erro real voltar a aparecer sem ser mascarado. Próximo passo: confirmar a hipótese da dupla conversão inspecionando uma seta real persistida, e decidir o fix — não persistir o formato convertido de volta em `slide.elements` (manter sempre skeleton), ou fazer o reverse-transform antes de salvar. Só depois disso investigar se o skeleton *original* da IA (antes de qualquer save) também tem problemas de sintaxe de vínculo (prompt/tool do `slideWorkflow`, `lib/mastra/`)

**Regeneração individual de outline**
- [x] `P1` Definir abordagem: reuso do `multiOutlineWorkflow` com `slideCount=1` — já implementado em `multiOutlineService().regenerate()`
- [x] `P2` Implementar rota — já existe como `POST /api/v1/app/presentations/[id]/outlines/[outlineId]/generate` (`multiOutlineService().regenerate()`), documentada em `http/v1/app/outlines.http` e coberta por `outlineActions().regenerate`/`useAppOutline().useRegenerate`

---

## Backlog
---

**Gaps de backend do outline (achados ao integrar o provider)**
- [ ] `P2` Deletar outline — `outlineRepository()` não tem método de remoção; hoje `onDelete` na página de outline só mexe em estado local, não persiste
- [ ] `P2` Adicionar outline manual — bulk-update só faz `UPDATE`, não `INSERT`; precisa de `outlineRepository().create()` + rota própria
- [ ] `P2` Persistir reorder — `outlineBulkUpdateSchema` não inclui `order`; hoje `onReorder` também só é local

**Gaps de backend do slide (achados ao integrar o Studio provider)**
- [ ] `P2` Deletar/adicionar/reordenar slide — mesmos gaps do outline (`slideRepository()` não tem remove/create único, `slideBulkUpdateSchema` não inclui `order`)
- [ ] `P3` `slide.status` não é atualizável via bulk-update — `onToggleHiddenSlide` (esconder/mostrar) não persiste

**Gaps de backend da listagem de presentations (achados ao integrar `AppPresentationsListProvider`)**
- [ ] `P3` Favoritar — schema não tem campo `favorited`
- [ ] `P3` Renomear/duplicar/compartilhar/copiar link — nenhuma dessas ações tem rota própria ainda
- [ ] `P3` Restaurar da lixeira / excluir definitivamente (1 item ou em lote) — só existe `moveToTrash`; falta o caminho inverso e a exclusão real (mesmo `presentationRepository().remove()` do job de retenção, ver item de Infraestrutura)
- [ ] `P3` Filtros (recentes/minhas/favoritas) — `Tabs` sem `onValueChange`, não filtra nada
- [ ] `P3` Nome de exibição do criador (`createdBy`) — só temos `userId`, sem lookup de nome de usuário

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
- [ ] `P2` Página `/presentations/[id]/outline` — listagem e edição dos outlines; botão de regenerar item individual (P2)
- [ ] `P2` Página `/presentations/[id]/studio` — editor Excalidraw por slide (ref: `inscribed/Canvas.tsx`)
- [ ] `P2` Página `/presentations/[id]/present` — modo apresentação fullscreen com `exportToImageUrls` (ref: `inscribed/PresentationMode.tsx`)
- [ ] `P2` Loading states durante geração (outline e slides)
- [ ] `P2` `AppPresentationsOutlineProvider` — substituir mock state por fetch real (`GET` presentation + outlines) e mutations (reorder/delete/add/regenerate) via API, na Fase 2b de integração dinâmica

**Pipeline AI — melhorias**
- [ ] `P2` Controle de densidade de elementos por slide — suporte a níveis light / medium / rich no prompt; expor como parâmetro no form
- [ ] `P2` Geração de slides em paralelo (um por outline)
- [ ] `P2` Retry automático em falha de tool call
- [ ] `P2` Registrar `Generation` e `Log` durante a geração
- [ ] `P2` Calcular custo real de geração com base nos tokens consumidos (`metadata.usage`) — integrar tabela de preços por modelo
- [ ] `P3` Tornar o modelo dinâmico — suporte a múltiplos providers (Gemini, Anthropic, etc.) configurável por workflow ou por usuário

**slide-creator-prompt — melhorias de qualidade** (fonte: `excalidraw-diagram-skill`, `ai-excalidraw`, `smart-excalidraw-next`)
- [x] `P3` Tabela de dimensões padrão por elemento no prompt — primário `~120×60`, secundário `~80×40`, ícone `~24×24`
- [x] `P3` Fórmula de largura de texto no prompt — `width = Math.max(chars × 8, 80)` para 1 linha; `chars × 8 / 2 + 20` para 2 linhas — evita texto truncado
- [x] `P3` Regra de snap de grid 20px no prompt — coordenadas sempre múltiplos de 20
- [x] `P3` Paleta estendida: variantes fill hachura/sólido/vazio por hierarquia de elemento
- [ ] `P3` Fórmula exata de dimensões de texto no prompt — `ch_width = fontSize`, `en_width = fontSize × 0.6`, `height = linhas × fontSize × 1.25`; alertar sobre bound text bidirecional (`boundElements + containerId`) — texto standalone sem `containerId` desaparece (ref: `ai-excalidraw/prompt.ts`)
- [ ] `P3` Ordem de emissão de elementos no prompt — background shapes primeiro, depois por nó: shape → label → setas; reduz colisões de sobreposição (ref: `excalidraw-diagram-skill/SKILL.md`)
- [ ] `P3` Visual patterns no prompt — catálogo de padrões de composição: `fan-out` (radial), `convergence` (funil), `spiral` (loop), `cloud` (ellipses agrupadas), `assembly line` (before→process→after), `side-by-side` (ref: `excalidraw-diagram-skill/SKILL.md`)

**lib/excalidraw**
- [ ] `P3` `parseSkeletons` — suporte a output com múltiplos blocos JSON separados; melhorar JSON repair: detectar padrão `["key":value]` → inserir `{`, trim trailing comma, fallback para `jsonrepair` npm (ref: `smart-excalidraw-next/lib/json-repair.js`)
- [ ] `P3` `optimizeArrows` — algoritmo `determineEdges()` production-grade: seleciona aresta ótima (left/right/top/bottom) por quadrante + distância; fixa bug Excalidraw `width=0 → width=1` (ref: `smart-excalidraw-next/lib/optimizeArrows.js`)
- [x] `P3` `lib/excalidraw/math/sizing.ts` — `calcTextWidth(text, language)` com +15% para pt/es/fr/de/it, `calcContainerHeight(lines, fontSize, padding)`, `snapToGrid(value, gridSize=20)` — injetáveis como contexto no prompt

**Templates & Community — Ciclo 3**
- [ ] `P3` Página `/app/app/templates` — galeria de templates curados pelo produto (admin-only); vitrine também no dashboard
- [ ] `P3` Página `/app/app/community` — galeria de presentations públicas (`visibility: public`) com filtro por tags e duplicar
- [ ] `P3` Dashboard section de templates — vitrine curada com N templates em destaque (dinâmico, via DB)
- [ ] `P3` Suporte a `visibility: public` na presentation — campo no schema + lógica de publicação
- [ ] `P3` AppNavRail — adicionar Templates e Community como sub-items de Presentations

**Chat de Edição (Agent) — Ciclo 3**
- [ ] `P2` Definir tools do agent de edição — baseado no modelo do `presentation-ai` (ref: `temp/presentation-ai/src/ai/agents/presentation/createAgent.ts`) — 8 tools: `edit_slide_properties`, `replace_image`, `change_theme`, `regenerate_slide`, `create_slide`, `delete_slide`, `webSearch`, `respond_to_user`
- [ ] `P2` Implementar agent com as 8 tools operando sobre `ExcalidrawElementSkeleton[]`
- [ ] `P2` Middleware `trimMessageHistory` — limitar contexto a últimas 4 mensagens para reduzir tokens
- [ ] `P2` Middleware de retry + JSON fallback para tool calls que falham (fonte: `presentation-ai/enforceStructuredToolCallsForLocalModels`)
- [ ] `P2` UI do chat — painel lateral com streaming de mensagens e preview de edições
- [ ] `P2` Edit diff tracking — capturar snapshot inicial dos elementos, computar diff (adições/remoções/movimentos), debounce 2s, alimentar o agent com o que mudou (ref: `excalidraw-mcp/src/edit-context.ts`)
- [ ] `P3` Sugestões contextuais — agent propõe edições com base no conteúdo atual do slide

**Templates no Editor — Ciclo 3**
- [ ] `P2` Definir biblioteca de templates como `ExcalidrawElementSkeleton[]` em `lib/excalidraw/templates/` — categorias: listas, boxes, gráficos, processos, comparação, especiais (fonte: `presentation-ai/templates.tsx`)
- [ ] `P2` Criar slides a partir de template sem passar pelo outline
- [ ] `P3` Tipos de template mapeiam para `OutlineRepresentation` — flowchart, mindmap, timeline, etc.

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
- [ ] `P3` Levantamento de todos os comandos de setup/dev das libs em uso (drizzle-kit, inngest-cli, next, etc.) — garantir que todos existem como script no `package.json` (não só rodados via `npx` avulso) e documentar num README/doc de onboarding
- [ ] `P3` Job de retenção — exclusão definitiva de apresentações em `status: trash` após N dias (limpa outlines/slides/generations associados). `presentationRepository().remove()` já existe pronto pra isso; `DELETE /api/v1/app/presentations/[id]` hoje só faz soft-delete (`presentationService().moveToTrash()`)
- [ ] `P3` Thumbnail gerado automaticamente após criação do slide
- [ ] `P3` Exportação PDF — jsPDF client-side, orientation auto, loop de slides (ref: `inscribed/export.ts`)
- [ ] `P3` Exportação PPT (ref: `presentation-ai/domToPptxConverter.ts` — client-side via PptxGenJS)
- [ ] `P3` Exportação de vídeo (WebM) e GIF — canvas + MediaRecorder para WebM, GIF.js para GIF (ref: `inscribed/export.ts`)
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

- [x] **App module — presentations/[id]/present — mapeamento de components completo, modo apresentação fullbleed** (i18n pt-BR / en-US / es · dados mock · sem lógica dinâmica)
  - `AppPresentationsPresentView` — sem provider de dados próprio, lê `slides`/`activeSlideId`/`onSelectSlide` direto do `AppPresentationsStudioProvider` (global) via `useAppPresentationsPresentNavigation()` (`src/hooks/app/`) — navegar aqui atualiza o mesmo `activeSlideId` do Studio, então voltar mantém o slide certo. Listener global de teclado (`←`/`→` navega, `Esc` sai) — ver ADR-008
  - `AppPresentationsPresentCanvas` — `ExcalidrawEditor` em `viewModeEnabled + zenModeEnabled`, remontado por `key={activeSlide.id}` (mesmo padrão do Studio/ADR-004) · overlay transparente dividido em metade esquerda/direita pra navegação por clique (bloqueia pan/zoom do Excalidraw durante a apresentação, ref: `excalidraw-slides`) · tamanho medido via `window.innerWidth/innerHeight` com listener de `resize`, não `height:100%`/`flex-1` — ver ADR-008 (motivo)
  - `AppPresentationsPresentNav` — pill flutuante única (`bottom-4`, sempre visível): sair da apresentação · anterior/contador/próximo · tela cheia (Fullscreen API real via `containerRef`) · tema (botão único cicla light→dark→system, sem dropdown)
  - Chrome nativo do Excalidraw (menu, toolbar, footer/zoom/undo-redo, botão de sair do zen mode, context menu) escondido via CSS em `globals.css`, escopado a `.app-presentations-present-canvas .excalidraw` — não afeta o Studio
  - `AppPresentationsPresentProvider` (`providers/app/`) — só estado de UI da própria página (`isFullscreen`, `containerRef`, `onToggleFullscreen`); nunca guarda slides
  - Novo dicionário `app-present.json` (pt-BR/en-US/es), registrado em `i18n/request.ts`
- [x] **App module — presentations/[id]/studio — mapeamento de components completo, incluindo responsividade mobile e painéis** (i18n pt-BR / en-US / es · dados mock · sem lógica dinâmica)
  - **Layout responsivo** — `page.tsx` usa `flex` (desktop) / `grid grid-rows-[1fr_auto]` (mobile): Canvas preenche o espaço restante (`1fr`) sem precisar calcular altura da faixa de slides manualmente
  - `AppPresentationsStudioSlideList` (desktop, aside `w-56` com `ScrollArea` customizada) e `AppPresentationsStudioSlideListMobile` (faixa horizontal fixa no rodapé) — mesmo estado/handlers do provider, dnd-kit alternando `verticalListSortingStrategy`/`horizontalListSortingStrategy` conforme o eixo
  - `AppPresentationsStudioSlideListItem` — redesenhado: drag handle como botão pequeno (`self-start`, tamanho de ícone) na lateral esquerda, sem bloquear o scroll horizontal no mobile · menu ⋮ com header mostrando o título (título não é mais exibido no corpo do card) · ações duplicar/ocultar/copiar link/ver detalhes do outline/excluir
  - `AppPresentationsStudioToolbar` — nova seção com `AppPresentationsStudioActions` (save · export · present · ⋮), posicionada dentro do `AppPresentationsStudioCanvas`, acima do editor — mesma composição em mobile e desktop
  - `AppPresentationsStudioPanel` (Configurações/Source/Histórico) — aside fixo no desktop (`hidden md:flex`), `Sheet` lateral direita no mobile via `useIsMobile()` (mesmo padrão do `ui/sidebar.tsx`) — ver ADR-007
  - `ExcalidrawEditor` sincroniza tema com `next-themes` (`resolvedTheme` → prop `theme` do Excalidraw, reativa) — ver ADR-006
  - `AppPresentationsStudioCanvas` — encapsula `ExcalidrawEditor` existente, remonta via `key={activeSlide.id}` (ADR-004: slides separados, sem frames) · `scrollToContent({ fitToViewport: true })` ao trocar de slide
  - `AppPresentationsStudioProvider` — mock de slides, captura elementos ativos via `excalidrawAPI.getSceneElements()` ao trocar/salvar · `title` é mock local (schema real deriva de `outline.title` via `outline_id`, relação 1:1)
  - Fix: import de `skeletonSerializer` (`@excalidraw/excalidraw`) adiado para `useEffect` client-only — provider é global (montado em `providers/index.tsx`) e o pacote toca `window` na avaliação do módulo, quebrando SSR de qualquer rota
  - Novo dicionário `app-studio.json` (pt-BR/en-US/es), registrado em `i18n/request.ts`
- [x] **App module — presentations/[id]/outline — mapeamento de components completo** (i18n pt-BR / en-US / es · dados mock · sem lógica dinâmica)
  - `hero/`: AppPresentationsOutlineHero (colapsa título → textarea de prompt editável + controls-bar de idioma/aspectRatio/slideCount/audience/scenario) · AppPresentationsOutlineHeroTags (badges dos parâmetros no estado colapsado) · AppPresentationsOutlineHeroControls · AppPresentationsOutlineHeroPrompt
  - `outline/`: AppPresentationsOutlineList (drag reorder via `@dnd-kit` · delete · add manual · summary) · AppPresentationsOutlineCard (regenerate individual · title/description/representation editáveis) · AppPresentationsOutlineBody · AppPresentationsOutlineBottomBar (ação "Gerar", separada do "Regenerar" do Hero)
  - `parameters/`: AppPresentationsOutlineParameters · AppPresentationsOutlineThemePicker/Card · AppPresentationsOutlineAmountPicker/Card (cards seletáveis para `theme`/`amount`, em vez de select dropdown)
  - Estado compartilhado extraído para `AppPresentationsOutlineProvider` (Context, `src/providers/app/`) — `page.tsx` só compõe as sections, sem prop-drilling
  - `src/providers/` reorganizado por módulo: `app/index.tsx` e `admin/index.tsx` agregam os providers de cada módulo (um arquivo por provider), registrados uma única vez em `src/app/layout.tsx`
  - Novo primitivo `SelectableCard` em `components/ui/blocks/`
- [x] **App module — app/(shell) — mapeamento de components completo** (i18n pt-BR / en-US / es · dados mock · sem lógica dinâmica)
  - `presentations/`: AppPresentationsHero · AppPresentationsHeader (trash toggle · badge count) · AppPresentationsToolbar · AppPresentationsTrashToolbar · AppPresentationsEmpty · AppPresentationCard (isFavorited · href|onSelect · overlay pointer-events-none) · AppPresentationCardFavorite · AppPresentationCardActions (DEFAULT + TRASH_VIEW_ACTIONS · favorite toggle · trash confirm) · AppPresentationTrashModal
  - `templates/`: AppTemplatesHero · AppTemplatesHeader · AppTemplatesToolbar · AppTemplatesFilters · AppTemplates (grid · empty · AppTemplateUseModal)
  - `community/`: AppCommunityHero · AppCommunityHeader · AppCommunityToolbar · AppCommunityFilters · AppCommunityTags · AppCommunity (grid · empty) · AppCommunityModal (view state: duplicate ↔ author) · AppCommunityModalDuplicateView (carousel · pagination · meta · footer) · AppCommunityModalAuthorView (identity · scroll grid · footer autônomo)
  - `criação manual`: AppDashboardNewModal wired em AppNavRail · AppDashboardRecentsHeader · AppPresentationsHeader
- [x] **App module — dashboard — mapeamento de components completo** (organisms · i18n em pt-BR / en-US / es)
  - `app/dashboard/hero/`: Hero (tagline com Sparkles · grid de features)
  - `app/dashboard/form/`: Form com engine-bar (Engine · Options responsivos) · body (Input · hint · Actions com Paperclip inline) · controls-bar (slideCount · language · aspectRatio)
  - `app/dashboard/suggestions/`: Suggestions (header com shuffle · grid 3 colunas) · SuggestionCard (ícone + badge na mesma linha · label)
  - `app/dashboard/recents/`: Recents (header com view-all button · grid 3 colunas · empty state) · RecentCard (full-bleed · badges flutuantes · overlay com título + seta)
  - Shell: Header · NavRail responsivo (bottom fixo mobile · lateral desktop · tooltips) · Footer · `next.config.ts` com redirects para todos os route groups · redirect server-side em `presentations/[id]/` → `/editor`
  - Nota: form de criação está no dashboard — não existe rota `/presentations/new`
- [x] **Landing module — mapeamento de components completo** (pages, organisms, molecules, atoms · i18n em pt-BR / en-US / es)
  - `landing/home`: Hero · Product · Features · Pricing · Testimonials · Cta · Faq
  - `landing/product/[slug]`: multi (Hero · HowItWorks · Modalities · Audience · Capabilities · Cta) · single (Hero · Inputs · Versions · Cta)
  - `landing/institutional/about`: Hero · Mission · Story
  - `landing/resources/blog`: Hero · Feed (empty state por categoria)
  - `landing/resources/blog/[slug]`: Hero · Content (empty state) · Suggestions (empty state)
  - `landing/resources/contact`: Hero · Info
  - `landing/transparency/legal/privacy-policy`: Hero · Content
  - `landing/transparency/legal/terms`: Hero · Content
  - Layout: Header (NavBrand · NavMenu · NavLanguageSwitcher · NavCta · NavMobile) · Footer (FooterBrand · FooterNav · FooterCopyright)
- [x] **i18n** — dicionários separados por domínio (`common`, `landing-nav`, `landing-home`, `landing-product`, `landing-resources`, `landing-institutional`, `landing-transparency`), carregamento paralelo via `Promise.all` em `request.ts`
- [x] **Navegação landing** — paths legais corrigidos, `whatsNew` → blog, footer produto atualizado com `multi` e `single`
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

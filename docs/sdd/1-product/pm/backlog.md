# Backlog

Parte do `pm.md` — ver `../pm.md` pro índice (ciclos, prioridades, como retomar).

---

**Gaps de backend do `/app/start` (achados ao refatorar o `AppStartForm`)**
- [x] `P2` Anexos (imagem/arquivo/link) — implementado (ver `decisions.md`). Persiste em Postgres temporário (`attachment`, `UNLOGGED`), sobe no `onSubmit`, entra no prompt do outline (imagem multimodal, arquivo com texto extraído, link como URL crua), apagado depois de usado
- [ ] `P3` Anexos — decidir se algum dia vamos buscar o conteúdo do link no servidor (hoje só URL crua no prompt) — se sim, precisa da proteção de SSRF (bloqueio de IP privado/DNS rebinding) que não foi implementada por não ser necessária ainda
- [ ] `P3` Anexos — `storage_blob`/`storage_attachment` (schema já existe) ainda sem consumidor: thumbnail de slide e imagem embutida no Studio (`slide.files` nunca enviado no `onSave`, gap já registrado abaixo) são os dois candidatos naturais
- [ ] `P3` Modo single: revisar quais dos 4 parâmetros extras (`amount/audience/scenario/theme`) realmente fazem sentido — só `slideCount` foi removido por ora (claramente inaplicável, é "número de slides"); os outros foram mantidos por decisão conservadora, não análise caso a caso
- [ ] `P3` Modal de aviso (`AppStartFormMeta`) — copy é placeholder genérico, precisa de texto definitivo (legal/produto define)
- [ ] `P3` Página de tutorial (`/landing/resources/tutorial`) — rota não existe, o link do form já aponta pra ela. Criar junto do trabalho de documentação

**Gaps de backend do outline (achados ao integrar o provider)**
- [ ] `P2` Deletar outline — `outlineRepository()` não tem método de remoção; hoje `onDelete` na página de outline só mexe em estado local, não persiste
- [x] `P2` Adicionar outline manual — implementado, mas só **acoplado ao add-slide do Studio**, não como rota própria de outline solto: `outlineRepository().createMany()` ganhou parâmetro `client` (transação), e `slideService().createManual()` cria outline+slide juntos (ver gap de slide abaixo). Página de outline em si (`/presentations/[id]/outline`) continua sem forma de adicionar item novo — esse caso específico não foi tocado
- [ ] `P2` Persistir reorder — `outlineBulkUpdateSchema` não inclui `order`; hoje `onReorder` também só é local

**Gaps de backend do slide (achados ao integrar o Studio provider)**
- [x] `P2` Adicionar slide (Studio) — implementado. `onAddSlide()` continua 100% local/instantâneo (decisão explícita: persistir só no clique de Salvar, não por chamada a cada clique, senão perde a resposta instantânea da UI). No `onSave()`, os slides que ainda são só locais (`isLocal`) são criados de verdade primeiro — `POST /presentations/[id]/slides` (aceita lote, não um por um), que cria o outline necessário junto (1º outline da presentation vira `cover`, os seguintes `content`) numa transação, devolve o id real pra cada `tempId` enviado, e só então o Zustand troca o id de mentira pelo real (`reconcileCreatedSlides`) antes do bulk-update de elements/appState de todo mundo. Testado ponta a ponta: presentation em branco → cria slide → vira capa de verdade → thumbnail funciona (ver gap de thumbnail abaixo)
- [ ] `P2` Deletar/reordenar slide (persistência) — `slideRepository()` não tem remove, `slideBulkUpdateSchema` não inclui `order` — continuam só locais (`onDeleteSlide`/`onReorderSlides` no Zustand). **`onDuplicateSlide` também continua só local** (mesmo problema do add antes da correção acima, não entrou no escopo desta rodada)
- [ ] `P3` `slide.status` não é atualizável via bulk-update — `onToggleHiddenSlide` (esconder/mostrar) não persiste

**Gaps de backend da listagem de presentations (achados ao integrar `AppPresentationsListProvider`) — `AppStartRecents` já integrado ao provider real; renomear/duplicar implementados, resto ainda não**
- [x] `P2` Renomear — `presentationService().rename()` + `PATCH /presentations/[id]` + `AppPresentationRenameModal` (input com título atual, Enter/botão salva) + wiring em Recents e na listagem completa. Testado ponta a ponta via curl (renomeia, persiste, rejeita título vazio com 400)
- [x] `P2` Duplicar — `presentationService().duplicate()`: clona `presentation` + `presentation_entry` (kind=custom) + todos os `outline`/`slide` com IDs novos (gerados na mão antes do insert, não via default do banco — evita depender da ordem de retorno de um `INSERT` em lote pra montar o mapa outline antigo→novo), tudo numa transação. `POST /presentations/[id]/duplicate`, sem modal de confirmação (ação instantânea). Testado ponta a ponta com outlines+slides reais seedados direto no banco — slides do clone apontam pros outlines clonados, não pros originais. Mesmo mecanismo ainda não reaproveitado pros Templates (Ciclo 3), que vai precisar de algo parecido
- [ ] `P3` Favoritar — precisa de tabela nova `presentation_favorite` (`presentation_id`, `user_id`, `created_at`, unique nos dois primeiros) — decidido explicitamente **não** ser um boolean solto em `presentation`, já nasce por-usuário pra não precisar redesenhar quando colaboração existir
- [ ] `P3` Compartilhar (modal: copiar link + convidar usuário específico) — Ciclo 5 (Colaboração), reaproveita schema que já existe: `invite_token` pro link (`/invite/[token]`), `presentation_member` pra convite direto por usuário. O mais caro do lote, é literalmente começar o Ciclo 5
- [ ] `P3` Copiar link — não é feature própria, é atalho do Compartilhar (mesma geração de `invite_token`, só pula o modal)
- [ ] `P3` Restaurar da lixeira / excluir definitivamente (1 item ou em lote) — só existe `moveToTrash`; falta o caminho inverso e a exclusão real (mesmo `presentationRepository().remove()` do job de retenção, ver item de Infraestrutura)
- [ ] `P3` Filtros (recentes/minhas/favoritas) — `Tabs` sem `onValueChange`, não filtra nada; depende de Favoritar existir primeiro
- [ ] `P3` Nome de exibição do criador (`createdBy`) — só temos `userId`, sem lookup de nome de usuário
- [x] `P2` Thumbnail do card — implementado. Capa = slide do outline `type=cover` (não posição — resolvido por join, `presentation-repository.ts`). Gerado client-side no `onSave()` do Studio via `exportToBlob` (Excalidraw só exporta em DOM real, não dá pra gerar no servidor), upload multipart pra `POST .../slides/[slideId]/thumbnail`, armazenado no R2 (`storage_blob`/`storage_attachment`, chave estável por slide — regenerar sobrescreve o mesmo objeto em vez de acumular), `slide.thumbnail` guarda a URL pública que a listagem já traz via join. Local dev usa MinIO em Docker (mesmo client S3, só troca endpoint/credenciais — ver `decisions.md`). Testado ponta a ponta via curl (upload, upsert sem duplicar linha, join na listagem com/sem capa)

**Pipeline AI**
- [ ] `P2` Geração de slides em paralelo (um por outline)
- [ ] `P2` Retry automático em falha de tool call
- [ ] `P2` Registrar `Generation` e `Log` durante a geração
- [ ] `P2` Calcular custo real de geração com base nos tokens consumidos (`metadata.usage`) — integrar tabela de preços por modelo
- [ ] `P3` Tornar o modelo dinâmico — seleção por plano via `model: ({ runtimeContext }) => ...` (Mastra "Dynamic Agents"), suporte a múltiplos providers (Gemini, Anthropic, etc.) — ver decisão em `decisions.md`
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
- [ ] `P3` Tornar o modelo dinâmico — seleção por plano via `model: ({ runtimeContext }) => ...` (Mastra "Dynamic Agents"), suporte a múltiplos providers (Gemini, Anthropic, etc.) — ver decisão em `decisions.md`

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
- [ ] `P3` Colaboração em tempo real — avaliar Y.js + WebSocket vs polling (ver `decisions.md`)

**Modalidades — Ciclo 5**
- [ ] `P3` Modalidade **Single: prompt → diagrama** — workflow simplificado sem outline; tipo e representação definidos pelo usuário
- [ ] `P3` Modalidade **Single: imagem → Excalidraw** — upload de imagem como referência; vision model gera skeleton baseado no conteúdo visual. Reaproveita infra já existente: multimodal de imagem (`lib/mastra/mappers/attachment-message-mapper.ts`) + pipeline `slideStructureTool` → `lib/excalidraw/{parse,normalize,serialize}`; falta só agent/prompt de "ler estrutura visual" em vez de "ler outline de texto"
- [ ] `P3` Modalidade **Single: foto de quadro branco → digitalização** — vision model lê anotações e gera ilustração Excalidraw fiel
- [ ] `P3` SEO — landing pages por caso de uso da modalidade imagem→Excalidraw (quadro branco, esboço à mão, screenshot de arquitetura, diagrama de brainstorming, fluxograma desenhado, captura de fluxograma) — mesma feature técnica, 1 landing por intenção de busca (ver `decisions.md`, "SEO — fundação técnica")
- [ ] `P3` Modalidade **Multi** — renomear fluxo atual para "multi" explicitamente na UI/rotas
- [ ] `P3` Visualização versátil no Single — modos: editor, fullscreen, embed (iframe exportável)

**Infraestrutura — Ciclo 4**
- [ ] `P3` Levantamento de todos os comandos de setup/dev das libs em uso (drizzle-kit, inngest-cli, next, etc.) — garantir que todos existem como script no `package.json` (não só rodados via `npx` avulso) e documentar num README/doc de onboarding
- [x] `P3` Job de retenção — implementado. `presentationService().purgeTrashed()` varre `status=trash` com `updatedAt` mais antigo que `TRASH_RETENTION_DAYS = 30` (`findTrashedBefore()`, sem escopo de usuário — é job de sistema, não request) e chama `remove()` (que já limpa storage) pra cada um. Rodando dentro do `scheduled-maintenance.ts` (mesma cron/step compartilhado, não function nova). `DELETE /api/v1/app/presentations/[id]` continua fazendo só soft-delete (`moveToTrash`) — o hard-delete só acontece via esse job, não por ação direta do usuário. Testado ponta a ponta: presentation trashada há 40 dias é purgada (com storage), trashada há 2 dias não é tocada
- [x] `P3` Thumbnail gerado automaticamente após criação do slide — feito junto do gap acima (`onSave()` do Studio), não só na criação inicial
- [x] `P3` `storage_blob`/`storage_attachment` órfãos ao apagar presentation — corrigido. Associação é polimórfica (`record_id` sem FK real, `ON DELETE CASCADE` de `presentation`→`slide` não alcança `storage_attachment`), então adicionei `presentationService().remove(id, userId)`: busca os slides da presentation, chama `storageService().deleteForRecords()` (apaga objeto no R2 — best-effort, não trava se a rede falhar — e as linhas `storage_blob`/`storage_attachment` correspondentes) **antes** de `presentationRepository().remove()` cascatear o resto. Testado ponta a ponta: upload de thumbnail → remove → confirma presentation/outline/slide/blob/attachment todos sumidos e o objeto no R2 retornando 404. Continua **sem caller em produção** (job de retenção acima ainda não existe) — o fix já está pronto esperando esse job
- [ ] `P3` Exportação PDF — jsPDF client-side, orientation auto, loop de slides (ref: `inscribed/export.ts`)
- [ ] `P3` Exportação PPT (ref: `presentation-ai/domToPptxConverter.ts` — client-side via PptxGenJS)
- [ ] `P3` Exportação de vídeo (WebM) e GIF — canvas + MediaRecorder para WebM, GIF.js para GIF (ref: `inscribed/export.ts`)
- [ ] `P3` Apresentações públicas (visibility: public)

**Custos & Estimativas**
- [ ] `P3` Analisar tokens consumidos por workflow — medir outline + slide em diferentes cenários
- [ ] `P3` Modelo de estimativa de custo por plano — ex: 100 usuários × N apresentações/mês × custo médio por geração
- [ ] `P3` Definir tiers de plano com base nas estimativas

**Monetização**
- [ ] `P3` Integração de pagamento (Stripe) — decisão revista, ver Asaas em `decisions.md`
- [ ] `P3` Planos com limites de geração
- [ ] `P3` Billing e histórico de uso

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
- [ ] `P3` Integração de pagamento (Stripe) — decisão revista, ver Asaas em `decisions.md`
- [ ] `P3` Planos com limites de geração
- [ ] `P3` Billing e histórico de uso

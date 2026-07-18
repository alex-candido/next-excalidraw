# Architecture Decision Records

---

## ADR-001 — ExcalidrawElementSkeleton como formato de dados dos slides

**Data:** 2026-05  
**Status:** Aceito

**Contexto:** Precisávamos de um formato para representar slides gerados por AI que pudesse ser armazenado no banco, transmitido pela API e convertido para o canvas Excalidraw.

**Decisão:** Usar `ExcalidrawElementSkeleton[]` como formato canônico. Skeletons são armazenados brutos no banco (jsonb) e convertidos para `ExcalidrawElement[]` apenas no cliente via `convertToExcalidrawElements`.

**Alternativas consideradas:**
- XML estruturado (abordagem do `presentation-ai` com Plate.js) — rejeitado por ser menos tipado e incompatível com a API nativa do Excalidraw
- JSON livre/schema próprio — rejeitado por duplicar o schema já definido pelo `@excalidraw/excalidraw`

**Consequências:** `lib/excalidraw/serialize/` é client-side only. O banco armazena skeletons brutos, nunca `ExcalidrawElement[]` completos.

---

## ADR-002 — Mastra como framework de AI pipeline

**Data:** 2026-05  
**Status:** Aceito

**Contexto:** Precisávamos de um framework para orquestrar agentes LLM com tool calls, steps tipados, scorers e metadata de execução.

**Decisão:** Usar Mastra com Google Gemini como provider principal. Workflows (`outlineWorkflow`, `slideWorkflow`) são compostos por steps tipados com schemas Zod.

**Alternativas consideradas:**
- LangChain/LangGraph — mais verboso, requer mais boilerplate para typing; `presentation-ai` usa essa stack
- Gemini SDK nativo — sem abstração de workflow; avaliado como opção de migração futura se o Mastra trouxer overhead desnecessário

**Consequências:** tools são definidas via `createTool` do Mastra. Se migrarmos para Gemini SDK nativo, os prompts e schemas Zod são reaproveitáveis — só a orquestração muda.

---

## ADR-003 — Tool call estruturada como mecanismo de output do LLM

**Data:** 2026-05  
**Status:** Aceito

**Contexto:** O LLM precisava retornar `ExcalidrawElementSkeleton[]` de forma confiável e estruturada.

**Decisão:** Usar tool call (function calling) como único mecanismo de output. O agente é instruído a sempre chamar a tool (`outlineStructureTool`, `slideStructureTool`) — nunca responder em texto livre.

**Alternativas consideradas:**
- Parsing de texto livre com `parseSkeletons` — mantido como fallback mas não como caminho principal; LLMs frequentemente falham em JSON puro sem function calling

**Consequências:** `validateSkeletons` é o caminho principal; `parseSkeletons` é fallback. Retry automático em falha de tool call é uma tarefa pendente (P2).

---

## ADR-004 — Slides separados por entidade (não frames do Excalidraw)

**Data:** 2026-05  
**Status:** Aceito

**Contexto:** O editor precisa navegar entre slides. Duas abordagens possíveis: (1) um canvas único com N frames do Excalidraw, cada frame = um slide; (2) um array de `ExcalidrawElementSkeleton[]` por slide no banco, canvas recarregado ao navegar.

**Decisão:** Slides separados por entidade. Cada `slide` tem seu próprio campo `elements: jsonb` no banco. O canvas é recarregado ao navegar entre slides.

**Motivação:** A estrutura do banco (`slide.elements` por registro) e o pipeline de geração (um `slideWorkflow.start()` por outline) já favorecem isolamento completo. Frames adicionariam complexidade de sincronização sem benefício real no MVP.

**Trade-offs descartados:**
- Frames (`inscribed/Canvas.tsx`): navegação mais fluida, mas payload cresce linearmente com o número de slides e drag entre slides seria complexo de persistir

**Consequências:** A página `/presentations/[id]/editor` mantém um slide ativo por vez. Navegação via `SlideList` sidebar dispara reload do canvas com os elementos do slide selecionado.

---

## ADR-005 — Modalidades Multi e Single como fluxos distintos

**Data:** 2026-05  
**Status:** Aceito (conceitual — implementação Ciclo 5)

**Contexto:** O produto atende dois casos de uso diferentes: apresentação completa (Multi) e diagrama único (Single).

**Decisão:** Tratar Multi e Single como modalidades separadas com workflows independentes. Single não passa por outline — vai direto para geração de elementos. Single também suporta vision model (imagem → Excalidraw).

**Consequências:** O `slideWorkflow` atual pode ser reutilizado no Single com parâmetros simplificados (tipo e representação fornecidos diretamente pelo usuário). Um step dedicado para vision (image → skeleton) precisará ser criado para o subtipo de digitalização de imagem.

---

## ADR-006 — Sincronização de tema do Excalidraw via next-themes

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** O app já usa `next-themes` (light/dark/system, `attribute="class"`), mas o canvas Excalidraw tem seu próprio sistema de tema interno (`theme?: "light" | "dark"`, sem conceito de "system").

**Decisão:** Centralizar a sincronização dentro do `ExcalidrawEditor` (wrapper único usado no Studio e nos sandboxes de dev) — lê `resolvedTheme` via `useTheme()` e repassa como prop `theme` pro `<Excalidraw>`. A prop é reativa (confirmado no código-fonte: `componentDidUpdate` do Excalidraw compara `prevProps.theme !== this.props.theme` e atualiza o estado interno), então o canvas se re-tematiza ao vivo sem lógica extra.

**Alternativas consideradas:**
- Sincronizar em cada consumidor de `ExcalidrawEditor` individualmente — rejeitado por duplicar lógica e arriscar inconsistência entre Studio e sandboxes

**Consequências:** Qualquer novo uso de `ExcalidrawEditor` ganha a sincronização automaticamente, sem precisar lembrar de passar `theme`. Guard de `mounted` evita mismatch de hidratação (mesmo padrão do `ThemeToggle`), com fallback `"light"` até montar.

---

## ADR-007 — Painéis secundários do Studio: aside fixo no desktop, Sheet no mobile

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** `AppPresentationsStudioPanel` (Configurações/Source/Histórico) precisa funcionar tanto em telas largas quanto estreitas. No mobile, a página usa um grid (`1fr`/`auto`) compartilhado com o Canvas e a faixa de slides — um aside fixo (`w-80`, altura calculada) não tem como participar desse grid sem estourar o layout ou disputar espaço com o Canvas.

**Decisão:** Reaproveitar o padrão que `ui/sidebar.tsx` já usa para o mesmo problema — `useIsMobile()` decide entre aside docked (desktop, `hidden md:flex`) e `Sheet` lateral direita (mobile, overlay portalado via `@base-ui/react/dialog`, fora do fluxo de layout da página).

**Alternativas descartadas:**
- Fazer o Panel compartilhar a mesma linha do grid que o Canvas (`row-start-1`, sobrepondo) — funcionava, mas exigia manter Canvas e Panel sincronizados manualmente em toda mudança futura de layout; descartado em favor do Sheet, que não depende do grid da página

**Consequências:** Esse padrão (aside no desktop, Sheet no mobile via `useIsMobile()`) vira a referência para qualquer outro painel secundário que precisar de tratamento mobile futuro (ex: settings, filtros).

---

## ADR-008 — Present mode: sem provider de dados próprio; canvas medido via `window.innerWidth/innerHeight`

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** `analysis.reference.md` cita `inscribed/PresentationMode.tsx` (`exportToImageUrls`, pré-renderiza todos os slides como imagem) como referência de Present Mode — mas essa abordagem pressupõe frames do Excalidraw, já rejeitados pelo ADR-004. Também analisamos `github.com/scastiel/excalidraw-slides` (`SlideEditor.tsx`) a pedido, mas esse repo usa o pacote antigo e descontinuado `excalidraw` (não `@excalidraw/excalidraw`), de uma época em que a API aceitava `width`/`height` como props diretas — removidas nas versões atuais (`ExcalidrawProps` não tem mais esses campos; confirmado no `types.d.ts` da versão instalada, 0.18.1).

**Decisão (dados):** `/presentations/[id]/present` não tem provider de dados próprio — reaproveita `useAppPresentationsStudio()` (já global, registrado em `providers/app/index.tsx`) via `useAppPresentationsPresentNavigation()` (`src/hooks/app/`), que centraliza a derivação de slides apresentáveis (filtra `isHidden`) e navegação anterior/próximo, consumida por `AppPresentationsPresentCanvas`, `AppPresentationsPresentNav` e o listener de teclado. `AppPresentationsPresentProvider` existe só para estado de UI da própria página (`isFullscreen`, `containerRef` da Fullscreen API) — nunca para slides.

**Decisão (tamanho do canvas):** `AppPresentationsPresentCanvas` mede `window.innerWidth`/`window.innerHeight` (com listener de `resize`) e aplica como `width`/`height` explícitos via inline style no wrapper do `ExcalidrawEditor` — não `size-full`/`height:100%`. Motivo: mesmo com a página ancorada em `h-screen` e a cadeia de flexbox correta, `height:100%` não se propagou de forma confiável até o canvas (comportamento observado e confirmado empiricamente, não só teórico) — o Excalidraw simplesmente não preenchia o espaço do pai a menos que o tamanho fosse um valor explícito. Como o Present ocupa a janela inteira (sem layout parcial como o Studio, que divide espaço com SlideList/Panel/Toolbar), medir a janela é uma fonte de tamanho legítima e sempre correta — mas essa medição fica isolada no `AppPresentationsPresentCanvas`, **não** no `ExcalidrawEditor` compartilhado, porque lá quebraria o Studio (cujo canvas ocupa só parte da tela).

**Alternativas descartadas:**
- `exportToImageUrls` — não se aplica sem frames (ver contexto)
- `width`/`height` como props do `<Excalidraw>` (técnica do `excalidraw-slides`) — API removida na versão atual do pacote
- `ResizeObserver` medindo o elemento pai do `ExcalidrawEditor` — tentado primeiro; falhou de forma sutil (media valores levemente errados fora do fullscreen e "travava" no tamanho do fullscreen até dar refresh, provavelmente por reobservar uma caixa que também dependia da mesma cadeia de CSS ambígua)
- Colocar a medição de janela no `ExcalidrawEditor` compartilhado — quebraria o Studio

**Consequências:** Chrome nativo do Excalidraw (menu, toolbar, footer/zoom/undo-redo, botão de sair do zen mode, context menu) é escondido via CSS em `globals.css`, escopado a `.app-presentations-present-canvas .excalidraw` (não afeta o Studio) — `viewModeEnabled + zenModeEnabled` já cobrem a maior parte, o CSS cobre o que sobra (ex: `.disable-zen-mode`, o botão nativo de sair do zen mode, substituído pelo botão de sair do `AppPresentationsPresentNav`).

---

## ADR-009 — E-mail transacional: Resend no lugar de Brevo

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** O projeto usava Brevo (`@getbrevo/brevo`, API REST) para os e-mails de verificação e reset de senha do Better Auth. Ao testar o fluxo de auth de ponta a ponta, toda tentativa de envio retornava `403 permission_denied` ("Your SMTP account is not yet activated"). Investigação: (1) chave de API trocada por uma do tipo certo — mesmo erro; (2) IP da máquina bloqueado por allowlist — resolvido, mesmo erro depois; (3) nova API key gerada — mesmo erro; (4) conta Brevo suspensa por segurança (e-mail de "cuenta en peligro", suspeita de vazamento de credencial) — trocada a senha, revogadas as chaves, criada conta nova — **mesmo erro na conta nova**; (5) trocado o transporte de API REST para SMTP relay (`smtp-relay.brevo.com:587` via `nodemailer`, credencial de tipo diferente) — **mesmo erro** ("Message failed: 502 ... SMTP account is not yet activated"). Confirmado: o bloqueio é de nível de conta, aplicado a qualquer transporte (API ou SMTP), em qualquer conta nova/free-tier — não é específico de uma chave, IP ou conta comprometida.

**Decisão:** Substituir Brevo por Resend (`resend` SDK). Resend não exige ativação manual de conta para envio transacional — funciona assim que a conta é criada e a API key é gerada, com domínio de teste (`onboarding@resend.dev`) liberado por padrão (com uma restrição própria: só entrega para o e-mail dono da conta Resend, até um domínio verificado ser configurado).

**Diferença de modelo de verificação de remetente (relevante para dev):** Brevo permite verificar um **e-mail único** (mesmo um gmail.com) sem precisar de domínio próprio — depois de verificado, envia para qualquer destinatário. Resend **não tem** essa opção — só aceita verificação de **domínio inteiro** (registros DNS). Não é bug nem configuração nossa; é diferença real de produto entre os dois provedores.

**Alternativas descartadas:**
- Continuar com Brevo (API REST ou SMTP relay) — bloqueio de conta persistente em duas contas diferentes, ambos os transportes
- SendGrid — também oferece verificação de e-mail único (como o Brevo), mas não avaliado; risco de fricção parecida de ativação em conta nova, comum no setor

**Consequências:** `src/lib/brevo/` → `src/lib/resend/` (mesma assinatura pública `emailClient().send({ to, subject, react })`, `email-senders.ts` inalterado). Resend aceita o componente React diretamente (`react: ReactElement`) em `resend.emails.send()` — não precisamos mais chamar `@react-email/render` manualmente. Em dev, `EMAIL_FROM_ADDRESS=onboarding@resend.dev` só entrega para o e-mail da conta Resend; antes de produção é necessário verificar um domínio próprio em resend.com → Domains.

---

## ADR-010 — RBAC: `customSession` (não `databaseHooks`) + resolução de permissões em duas camadas (sessão para UX, service para autorização real)

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** O schema de RBAC (`group`, `user_group`, `permission`, `group_permission`, `user_permission`) já existia, mas `session.user.group` nunca era populado pelo Better Auth — o client só enxerga os campos nativos de `user`. `auth-route-middleware.ts` já esperava `session.user.group` (usado para redirecionar por `groupRedirects`/`groupAllowedRoutes`), então essa era a peça faltante pro RBAC baseado em grupo funcionar de ponta a ponta. Avaliamos `databaseHooks` do Better Auth primeiro — rejeitado porque opera sobre o registro bruto do `Session`/`User` no banco (write hooks), não sobre a resposta enriquecida que o client de fato consome via `authClient.useSession()`.

**Decisão (mecanismo):** Usar o plugin oficial `customSession` (server) + `customSessionClient<typeof auth>()` (client, só inferência de tipo). `customSession` embrulha o endpoint `get-session` e permite devolver um objeto arbitrário como novo shape de sessão — usado para enriquecer `session.user` com `group` (nome do grupo do usuário) e `permissions` (lista de chaves já resolvidas), calculados por `permissionService().getUserPermissions(userId)`.

**Decisão (resolução de permissões):** `group_permission` define o default por grupo; `user_permission` guarda overrides pontuais por usuário (`PermissionType.grant`/`deny`). Resolução: começa com as permissions do grupo, aplica os grants do usuário, e por último remove as negadas — **deny sempre vence**, inclusive sobre um grant do próprio usuário (não deveria coexistir pra mesma permission, já que `user_permission` tem unique em `(user_id, permission_id)`, mas a ordem de aplicação garante a precedência mesmo assim). Model equivalente ao sistema de permissions do Django (`user.has_perm()`, grupos + overrides individuais).

**Decisão (duas camadas de verificação, não redundantes — responsabilidades diferentes):**
1. **Sessão (`session.user.permissions`)** — usada só no client, pra UX (esconder/desabilitar ações que o usuário não pode executar, evitar disparar uma request que vai tomar 403). Não é fonte de autorização: pode estar servida do cookie cache do Better Auth, desatualizada em relação ao banco.
2. **Service, no momento da ação** — `permissionService().hasPermission(userId, key)` chamado dentro do service (não na `route.ts`, que só delega), antes da mutação, sempre lendo o estado atual do banco. Esta é a única camada que efetivamente autoriza ou barra a ação.

**Estrutura criada:** `server/repositories/auth/permission-repository.ts` (`findGroupWithPermissions`, `findUserPermissionOverrides` — read-only, via relational query API) + `server/services/auth/permission-service.ts` (`getUserPermissions`, `hasPermission` — resolução). `hooks/use-permission.ts` (`usePermissions()`) espelha isso no client, lendo direto de `session.user.permissions` (sem query própria) — fail-closed (`session.data` ausente/pendente → `permissions: []`). Nenhuma rota/service de domínio (presentation/outline/slide) nem tela foi alterada ainda para usar `hasPermission`/`usePermissions` — isso acontece durante a integração dinâmica de cada módulo (app, depois admin), não nesta etapa. `UserMenu` (`components/ui/user-menu.tsx`) perdeu o cast temporário `(user as {group?: string})`, já que `user.group` agora vem tipado de verdade via `customSessionClient`.

**Alternativas descartadas:**
- `databaseHooks` — não enriquece a resposta que o client consome, só o registro bruto do banco
- Calcular permissions só no momento da ação (sem popular a sessão) — descartado como única fonte, porque perde a camada de UX (esconder ações não permitidas antes de disparar a request); mantido como camada complementar, não substituta

**Consequências:** Qualquer novo módulo que precisar checar permissão de ação (app, depois admin) reusa `permissionService().hasPermission(userId, key)` dentro do próprio service, sem precisar reimplementar a resolução grupo+overrides. Fica pendente decidir se, quando o volume de checagens crescer, vale a pena usar o cookie-cache do Better Auth pra evitar uma query por request em rotas protegidas (não é um problema agora, só uma consideração de performance futura).

---

## ADR-011 — Documentação de API: Scalar + zod-openapi no lugar do Next REST Framework

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** Os `.http` (`src/http/`) já cobrem teste rápido via REST Client, mas não têm uma UI navegável/compartilhável. Avaliamos duas opções pra gerar essa documentação a partir do que já existe (schemas Zod em `schemas/app/`, source of truth de input/output de cada rota).

**Decisão:** `zod-openapi` (gera o documento OpenAPI 3.1 a partir dos schemas Zod já existentes, sem duplicar tipo nenhum) + `@scalar/nextjs-api-reference` (só renderiza esse documento numa UI interativa). Confirmado suporte nativo a Zod v4 no `zod-openapi` (import direto de `zod`) antes de instalar.

**Alternativa descartada — Next REST Framework:** exigiria reescrever os 11 `route.ts` existentes pro builder próprio dele (`route.get(...).handler(...)`) pra conseguir introspectar os schemas — invasivo e quebra a convenção já estabelecida (`route.ts` fino, delega pra `services/`). Scalar + zod-openapi é puramente aditivo: nenhum `route.ts` foi alterado.

**Estrutura:** `lib/openapi/document.ts` (`createDocument()` referenciando os schemas de `presentation-schema.ts`, `presentations/multi-schema.ts`, `slide-schema.ts`) → servido em `app/dev/openapi.json/route.ts` → renderizado em `app/dev/api-docs/route.ts` (Scalar). Fora do roteamento `[lang]` por ser ferramenta de dev, não rota de produto — mesmo racional do antigo `app/dev/sandbox/` (removido, movido pro usuário pra `./temp`).

**Consequências:** Cobre hoje só as 11 rotas de `/api/v1/app/presentations/**`. Ao adicionar rotas novas (admin, settings), o padrão é: schema já existe em `schemas/`, só adicionar a entrada correspondente em `lib/openapi/document.ts`. Não substitui os `.http` — continuam sendo o fluxo rápido de teste manual via REST Client; o Scalar é complementar (UI navegável, sem side-effect ao só abrir a página).

---

## ADR-012 — Processamento em background: Inngest nas 4 rotas de generate/regenerate

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** As rotas de geração via IA (`outlines/generate`, `outlines/[id]/generate`, `slides/generate`, `slides/[id]/generate`) rodavam o workflow do Mastra e persistiam o resultado de forma **síncrona**, dentro do próprio handler da rota — o client ficava esperando a duração inteira da geração (dezenas de segundos). Se o usuário navegasse pra outra rota ou desse refresh, a conexão HTTP era perdida e o client nunca saberia se/quando terminou (mesmo que o trabalho no servidor completasse). Além disso, sem retry automático: qualquer falha transitória (rede, rate limit do LLM) exigia o usuário disparar tudo de novo manualmente.

**Decisão (ferramenta):** Inngest — execução durável orientada a eventos, já com retry automático por function e memoização por `step.run()`. A tabela `generation` (`GenerationType`/`GenerationStatus`: pending/completed/failed) já existia no schema e já era exatamente o mecanismo necessário pra rastrear esse status assíncrono — nenhuma migration nova precisou ser criada.

**Decisão (contrato de resposta):** Antes de mexer na execução em si, as 4 rotas de generate/regenerate passaram a responder com um envelope discriminado (`generationResponseSchema`, `schemas/app/generation-schema.ts`): `{status: "completed", data: T} | {status: "pending", generationId}`. Isso desacopla a mudança de contrato da mudança de implementação — `actions/app/` e `hooks/app/` já tipam pros dois branches antes de qualquer rota virar assíncrona de fato.

**Decisão (rollout):** Migração rota por rota (não um `/v2` paralelo nem "big bang"), validando cada uma via curl antes de seguir pra próxima — `outlines/generate` primeiro, depois `outlines/[id]/generate`, `slides/generate` e `slides/[id]/generate`, todas seguindo o mesmo formato:
1. `route.ts` cria a `generation` (status: pending) e despacha `inngest.send({name: "...", data: {..., generationId, ...}})`, respondendo `202` com `{status: "pending", generationId}` na hora — sem esperar a IA.
2. Uma function em `lib/inngest/functions/` por evento (`generate-outline.ts`, `regenerate-outline.ts`, `generate-slides.ts`, `regenerate-slide.ts`), cada uma rodando o service correspondente dentro de um `step.run()`, usando o `generationId` já criado.
3. Cliente descobre que terminou dando poll em `GET /presentations/:id` / `GET /presentations/:id/slides` — não existe endpoint de status dedicado ainda.

Duas variações no meio do caminho, pela forma como cada service já rastreava (ou não) generation antes:
- `multiOutlineService().regenerate()` **não tinha nenhum tracking de generation** — adicionado do zero (aceita `generationId` externo, igual `generate()`)
- `slideService().generate()` (lote) já cria uma `generation` **por item** internamente — isso ficou como está; o `generationId` que a rota cria é só um wrapper pra rastrear o lote inteiro, atualizado pela function após a chamada ao service (não passado pra dentro dele)

**Ambiente de dev:** `bun run dev:all` (script novo, usa `concurrently` pra rodar `next dev` + `inngest-cli dev` juntos, prefixados/coloridos) + `INNGEST_DEV=1` no `.env.local` (sem isso o SDK assume modo cloud e exige signing key). Em produção, quem faz esse papel é o serviço cloud da Inngest (`INNGEST_EVENT_KEY`/`INNGEST_SIGNING_KEY`, integração via Vercel Marketplace — sincroniza automaticamente a cada deploy, ainda não configurado).

**Armadilhas encontradas:**
- API do `createFunction` na versão instalada (4.12.1): não é mais `createFunction(config, trigger, handler)`, e sim `createFunction({ id, triggers: { event } }, handler)` (trigger dentro do primeiro argumento)
- `inngest-cli` via `npx inngest-cli@latest` falha (`Inngest CLI binary not found` — postinstall que baixa o binário nativo é pulado numa instalação efêmera). Resolvido instalando como devDependency local (`bun add -d inngest-cli` + `bun pm trust inngest-cli`) e apontando o script pro binário local, não pro `npx ...@latest`

**Alternativa considerada e descartada — `after()` (`next/server`, nativo, sem serviço externo):** resolveria a parte de "sobrevive a navegação/refresh do usuário" (via `waitUntil` da Vercel), mas sem retry automático, sem checkpointing por step (se cair no meio é tudo-ou-nada) e preso ao `maxDuration` da rota (a geração de slides em lote já passa de 90s). Fica registrado como opção mais simples pra casos que não precisam dessas garantias (ex: incrementar `presentation.viewsCount` de forma fire-and-forget) — não é substituto do Inngest pros fluxos de geração via IA.

**Outras alternativas descartadas:**
- Manter síncrono e só aumentar o timeout da rota — não resolve o problema de perder o resultado se o client navegar/atualizar a página
- BullMQ/Redis — exigiria infra própria (Redis) só pra isso; Inngest já resolve execução durável + retry sem infra adicional pro estágio atual do projeto

**Consequências:** `multiOutlineService().generate()`, `multiOutlineService().regenerate()` e `slideService().regenerate()` mudaram de assinatura (recebem `generationId` como parâmetro) — únicos callers eram as rotas, então sem impacto em outros lugares. `slideService().generate()` manteve a assinatura (tracking interno por item preservado). Todas as 4 rotas validadas end-to-end manualmente (curl): respondem `202` instantâneo, function completa em background (visível no dashboard do Inngest Dev Server), resultado aparece via poll depois.

---

## ADR-013 — Providers globais de `app/` não podem usar `useRouter`/`Link` de `@/i18n/navigation`

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** Ao integrar `AppStartProvider` e `AppPresentationsOutlineProvider` com navegação real (redirecionar pro outline/studio depois de criar/gerar), ambos quebraram em runtime com `Error: No intl context found`. Causa: `AppProviders` (que monta todos os providers de `app/`, incluindo esses dois) é renderizado por `Providers` em `app/layout.tsx` — o layout **raiz**, fora do segmento `[lang]`. O `NextIntlClientProvider` só é montado dentro de `app/[lang]/layout.tsx`, um nível abaixo. Como esses providers são montados como wrapper (não como `children` que fluem pra dentro do `[lang]/layout.tsx`), o corpo do próprio provider executa **fora** do contexto do next-intl — mesmo que seus componentes filhos (que de fato renderizam dentro do `{children}`) tenham acesso normal a esse contexto.

**Decisão:** Dentro do corpo de qualquer provider montado em `providers/app/` (ou qualquer wrapper global equivalente), usar `useRouter`/`useParams` de `next/navigation` (puro, sem depender de contexto do next-intl) — nunca `@/i18n/navigation`. Como a locale-prefix automática do wrapper i18n não está disponível aqui, o path precisa ser montado manualmente: `useParams<{ lang: string }>()` fornece o `lang` da rota atual (isso funciona porque `useParams` só lê o segmento da URL, não depende de nenhum contexto React) para prefixar: `router.push(\`/${lang}/app/...\`)`.

Regra prática: **componentes renderizados como filhos** (páginas, components que vivem dentro da árvore de `{children}`) podem seguir usando `@/i18n/navigation` normalmente — o problema é específico de código que roda no corpo de um provider que embrulha `{children}` a partir de fora do `[lang]/layout.tsx`.

**Alternativas descartadas:**
- Mover `<Providers>` de `app/layout.tsx` pra dentro de `app/[lang]/layout.tsx` — resolveria o problema na raiz, mas é uma mudança estrutural maior (afeta toda a árvore de providers, incluindo landing/auth/admin) só para resolver algo que tem workaround simples e localizado

**Consequências:** Qualquer provider novo em `providers/app/` que precisar navegar (o próximo é o `AppPresentationsStudioProvider`) deve seguir esse mesmo padrão desde o início — `next/navigation` + `useParams()` pro locale, não `@/i18n/navigation`.

---

## ADR-014 — `binding-repairer`/`element-orderer` conectados ao pipeline; `normalizeSkeletons()` roda em dois pontos (tool call e fallback de texto)

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** Em produção, um slide de rede/arquitetura (representação `network`) foi gerado com uma seta (`link_4`) contendo `start: { id: "node_pc" }` mas **sem** `end` — a IA emitiu um binding incompleto. `arrows-normalizer.ts` já existia mas devolvia a seta intocada quando faltava um dos dois lados (`if (!startId || !endId) return el`), deixando `x`/`y`/`width`/`height` indefinidos. Isso virava `NaN` assim que qualquer coisa tentava desenhar a seta — confirmado em dois pontos: a prévia SVG da sidebar do Studio (`exportToSvg`) e o próprio editor Excalidraw ao vivo (`onChange`).

Investigando o problema, veio à tona que `excalidraw.pipeline.md` já **documentava** uma sequência `repair (binding-repairer) → order (element-orderer) → normalize (arrows-normalizer)` "dentro do `slideStructureTool`" — mas o código real nunca chamava `binding-repairer` nem `element-orderer` em lugar nenhum (confirmado via grep: zero referências fora dos próprios arquivos). Só `arrows-normalizer` estava de fato conectado. Ou seja: o pipeline documentado nunca foi totalmente implementado, e a lacuna específica que causou o bug (binding incompleto) nunca foi coberta por nenhum dos três módulos como estavam.

**Decisão (arrows-normalizer):** em vez de devolver a seta intocada quando só um lado do binding resolve (ou nenhum dos ids existe no slide), ancorar no lado que resolveu e usar um comprimento padrão (150px, direção esquerda→direita) — nunca deixar `x`/`y`/`width`/`height` não-finitos.

**Decisão (wiring):** criar `normalize/skeleton-pipeline.ts` (`normalizeSkeletons()`) como ponto único de orquestração dos 3 módulos já implementados (`repair → order → normalize`), chamado em **dois** lugares:
1. `slide-structure-tool.ts` — caminho principal (tool call), como o doc já previa
2. `slide-workflow.ts`, no fechamento do step, sobre o resultado final — cobre também o fallback de texto livre (`elementParser().parse()`), que nunca passava por nenhum desses módulos antes (só `elementParser().validate()`, sem repair/order/normalize)

Rodar duas vezes no caminho da tool é redundante mas idempotente — sem custo real, e garante que nenhum caminho de geração fique desprotegido no futuro, mesmo que alguém esqueça de encadear os módulos manualmente num novo call site.

**Decisão (prompt):** reforçada a regra "nunca use só um dos dois" no bloco `ELEM_ARROW` compartilhado (`slide-creator-prompt.ts`) e adicionado o exemplo JSON que faltava no guia `network` (era o único guia de representação sem exemplo embutido — menos grounding pro modelo nesse caso específico).

**Alternativas descartadas:**
- Só corrigir o guard do `arrows-normalizer` (fix pontual, sem tocar wiring) — resolveria o caso relatado, mas deixaria `binding-repairer`/`element-orderer` órfãos e o fallback de texto livre sem nenhuma normalização, repetindo o mesmo padrão de bug (módulo existe, não é chamado) pra outra classe de problema (texto flutuante fora do container, z-order errado)
- Manter a normalização só dentro do `slideStructureTool` (como o doc original descrevia) — deixaria o fallback de texto livre desprotegido

**Consequências:** `element-parser.ts` voltou a ser só `{ parse, validate }` (sem normalizar internamente) — normalização vive inteira em `normalize/`, orquestrada por `skeleton-pipeline.ts`. `theme-applicator` e `element-sizing` continuam intencionalmente fora do pipeline (Ciclo 4 e P3 backlog, respectivamente — não fazem parte deste fix). `elementsGenerator`/`representation-generators.ts` (vazio) seguem fora de escopo — são para o sandbox de dev, não para o pipeline de IA.

---

## ADR-015 — `theme-applicator` conectado via papéis semânticos; `text-wrapper`/`grid-snapper` novos; `lib/excalidraw/index.ts` como ponto único de entrada

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** Seguindo o ADR-014, revisamos se `theme-applicator`/`element-sizing` (ambos com testes prontos, nunca conectados) resolveriam classes de problema parecidas com o bug de binding incompleto — e se dava pra reduzir o prompt (`slide-creator-prompt.ts`, ~590 linhas) descarregando pra código o que a IA hoje calcula na mão (a mesma categoria de aritmética que ela já erra, como visto no ADR-014).

Achados da investigação:
1. **`SEMANTIC_PALETTE`** (17 linhas, tabela de cores hex genérica) nunca era usada em produção — só entra no branch `else` de `if (context) {...} else { SEMANTIC_PALETTE }`, e `context` é sempre truthy (`slideService()` sempre manda `amount` real). Peso morto puro.
2. **Os exemplos JSON embutidos nos guias de representação** (flowchart, network, timeline...) usavam hex fixos de um palette de 8 papéis semânticos — só que a paleta injetada pra IA usar (`buildPalettePrompt`, 6 papéis: canvas/stroke/text/primary/secondary/accent) era outra. Ou seja: os exemplos **ignoravam o tema selecionado** — se a IA copiasse o hex do exemplo (comportamento típico de few-shot), o tema real da Presentation (Cornflower, Sunset, etc.) não fazia diferença nenhuma na cor gerada.
3. Investigando se `element-sizing` (`calcTextWidth`/`calcContainerHeight`) resolveria overflow de container-com-label, descobrimos que **o próprio `@excalidraw/excalidraw` já resolve isso** — `convertToExcalidrawElements` → `bindTextToContainer` → `redrawTextBoundingBox` mede o texto com canvas real (client-side) e **expande o container automaticamente** se não couber, inclusive quando `width`/`height` são omitidos (viram `0` pro tipo com label — código-fonte confirmado). Isso é estritamente melhor que qualquer heurística nossa (`chars × 8`), que só existe porque não há canvas real disponível server-side.
4. **Texto livre (não vinculado a container)** não tem esse auto-grow — o Excalidraw não quebra `text` sozinho, e sem canvas real server-side não dá pra medir de verdade. Aqui sim havia uma lacuna real: a IA calculava manualmente onde quebrar linha (`chars × 8`, `(XMAX−x)÷(fontSize×0.6)`), a mesma classe de erro aritmético já vista nas setas.

**Decisão (papéis semânticos, não paleta hex):** `presentation-themes.ts` ganha `SemanticRole` (`success`/`warning`/`danger`/`external`/`process`/`trigger`/`neutral`) com 2 tabelas compartilhadas (`SEMANTIC_LIGHT`/`SEMANTIC_DARK`, por `mode` do tema — verde=sucesso significa a mesma coisa em qualquer tema decorativo, só muda o contraste claro/escuro). A IA passa a definir `role` no elemento (nome, não hex); a cor real é resolvida em código, depois da geração, a partir do tema de verdade da Presentation. Isso elimina o problema #2 (exemplos que ignoravam o tema) por construção — não tem mais hex nenhum no prompt pra copiar errado.

**Decisão (theme-applicator aditivo):** `apply(skeletons, palette, semanticRoles?)` ganha um 3º parâmetro opcional. Quando um elemento tem `role` reconhecido E `semanticRoles` foi passado, o papel tem prioridade sobre a hierarquia de `fillStyle` (que continua existindo, controlando peso/textura, não mais cor). Sem `role`/`semanticRoles`, comportamento idêntico ao original — os 11 testes existentes continuaram passando sem alteração.

**Decisão (não construir auto-sizer de container):** dado o achado #3, não criamos nenhum pós-processador de tamanho pra container-com-label — o auto-grow do próprio Excalidraw já é estritamente melhor. O prompt passou a pedir só uma estimativa razoável de `width`/`height` (não mais uma fórmula exata), mantendo a tabela de Dimensões de Referência como guia aproximado (ainda necessária pra centralização, que depende de saber um tamanho antes do render real). `elementSizing().calcContainerHeight` fica sem consumidor — decisão consciente, documentada, não esquecimento.

**Decisão (text-wrapper, novo):** dado o achado #4, criado `normalize/text-wrapper.ts` — quebra automaticamente texto livre que não caberia na largura disponível, usando `elementSizing().calcTextWidth` (heurística, server-side). Ignora texto vinculado a container (já resolvido pelo Excalidraw). O prompt não pede mais cálculo manual de caracteres-por-linha.

**Decisão (grid-snapper, novo):** criado `normalize/grid-snapper.ts` — arredonda `x`/`y`/`width`/`height` pro grid de 20px em código (exceto `width`/`height` de `arrow`/`line`, pra não desfazer o fix de `width:0→1` do ADR-014). O prompt não precisa mais instruir "todas as coordenadas devem ser múltiplos de 20".

**Decisão (dois estágios em `normalizeSkeletons`):** o Estágio 1 (repair/order/arrows, do ADR-014) não depende de nada externo à Presentation e roda sempre. O Estágio 2 (theme/wrap/snap, novo) precisa de `context` (`palette`, `semanticRoles`, `canvasWidth`, `language`) e só roda quando o chamador passa esse contexto — hoje só `slide-workflow.ts` (que resolve tema/idioma/canvas da Presentation), não `slide-structure-tool.ts` (que não tem esse acesso).

**Decisão (ponto único de entrada — `lib/excalidraw/index.ts`):** criado `excalidrawSkeleton()`, mesma convenção de actions/store/hooks já usada no resto do projeto — uma factory, um objeto de capacidades relacionadas (`parse`, `validate`, `normalize`, `size`, `theme`, `generate`) mais um atalho (`fromAiOutput(raw, context?)`) que resolve validate+normalize num passo só. `slide-structure-tool.ts` e `slide-workflow.ts` migrados pra usar esse ponto único em vez de importar `element-parser`/`skeleton-pipeline`/`presentation-themes` separadamente. `serialize/` (`skeleton-serializer.ts`) fica **fora** desse barrel de propósito — toca `window` na avaliação do módulo (`convertToExcalidrawElements`), e um import estático aqui quebraria SSR pra qualquer consumidor do barrel; continua exigindo import dinâmico client-only.

**Alternativas descartadas:**
- Construir um auto-sizer de container via `element-sizing` mesmo assim, "já que o código existe" — descartado depois de confirmar que o Excalidraw já faz isso melhor (medição real vs. heurística); teria sido esforço duplicado e uma fonte a mais de imprecisão
- Dar às 10 identidades de tema (cores decorativas) uma paleta semântica própria cada uma (60 pares hex) — descartado por inconsistência de significado (verde deveria sempre comunicar sucesso, independente da identidade visual escolhida) e por custo de manutenção; 2 tabelas compartilhadas por `mode` resolvem isso
- Manter `buildPalettePrompt` (hex por tema) coexistindo com `role` — descartado: teria dois canais de cor conflitantes no mesmo prompt (exatamente o bug #2 encontrado)

**Consequências:** `slide-creator-prompt.ts` não tem mais nenhum hex literal — cor é sempre `role` (ou ausência dele = neutral) ou `fillStyle` (peso/textura). Todos os 6 exemplos JSON embutidos (cover, flowchart, sequence, timeline, network, architecture) reescritos pra usar `role`. Hierarquia de texto (título/label/anotação) deixou de ser por cor (`strokeColor` variado) e passou a ser por `fontSize`/`opacity` — texto sempre usa a cor única do tema (`palette.text`), já que `theme-applicator` nunca variou cor de texto por role. Suite de testes cresceu de ~50 pra 119 (novos arquivos: `presentation-themes.test.ts`, `text-wrapper.test.ts`, `grid-snapper.test.ts`, `skeleton-pipeline.test.ts`, `integration/full-pipeline.test.ts` — este último simula saída real da IA, incluindo a regressão exata do ADR-014 e casos de erro novos, ponta a ponta via `excalidrawSkeleton().fromAiOutput()` — mais os novos casos em `theme-applicator.test.ts`), todos verdes.

---

## ADR-016 — Capa da presentation: SVG inline em `slide.thumbnail` (texto) no lugar de PNG no R2

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** A capa (thumbnail) do slide de outline `type=cover` era gerada via `exportToBlob` (raster PNG, `maxWidthOrHeight: 400`), enviada como `multipart/form-data` pra uma rota dedicada, validada por **magic bytes** (pacote `file-type`, só reconhece PNG/JPEG/WEBP/GIF) e persistida como URL no R2 (`storageService().upsertThumbnail`). O Studio já calcula um SVG do slide ativo pra prévia da sidebar (`app-presentations-studio-slide-preview.tsx`, via `exportToSvg`) — dois mecanismos de export do Excalidraw pra dois usos parecidos.

Cogitamos trocar o PNG pelo mesmo SVG do preview, mas persistindo-o como **arquivo** no R2 (só trocando o formato) — investigação revelou que isso não seria um drop-in: `fileUtils().validate()` não reconhece SVG (sem magic number, é texto) e rejeitaria o buffer antes mesmo de chegar no storage; a chave/nome do arquivo no R2 estava hardcoded como `.png`. Reavaliando o desenho: como `slide.thumbnail` já é uma coluna `text` (não `varchar`, sem mudança de schema necessária), decidimos guardar o **texto do SVG diretamente**, sem storage/arquivo nenhum.

**Decisão:** `slide.thumbnail` passa a guardar o **texto SVG** (serializado via `XMLSerializer`), não mais uma URL de R2. Renderizado no `<img>` via `data:image/svg+xml;charset=utf-8,${encodeURIComponent(...)}` (`resolveThumbnailSrc`, `lib/utils/thumbnail.ts`) — nunca `dangerouslySetInnerHTML`, pra manter o mesmo padrão de renderização já usado nos dois consumidores (`app-presentation-card.tsx`, `app-presentations-studio-slide-list-item.tsx`) sem introduzir um padrão novo a revisar. `resolveThumbnailSrc` detecta o conteúdo (`<svg` vs URL) em vez de assumir um formato só — presentations antigas com URL de R2 ainda salva continuam funcionando sem migração de dados.

**Decisão (atomicidade):** o SVG é calculado no client (`renderSvgThumbnail`, `lib/excalidraw/serialize/svg-thumbnail.ts` — dynamic import do `exportToSvg`, mesmo motivo de sempre: toca `window` na avaliação do módulo) a partir dos **mesmos** `elements` que estão sendo persistidos, e vai **no mesmo** `bulkUpdate` que salva `elements`/`appState` (`slideBulkUpdateItemSchema` ganhou um campo opcional `thumbnail`, só preenchido pro slide de capa) — não é mais uma chamada HTTP separada depois. Isso elimina uma janela real que já existia: antes, o upload da thumbnail era `await uploadCoverThumbnail(...).catch(err => console.warn(...))` — uma falha ali era engolida silenciosamente, deixando `elements` salvo e a capa não, sem ninguém perceber. Com os dois no mesmo request, é uma escrita só: ou salva tudo, ou nada.

**Decisão (endpoint dedicado mantido, mas simplificado):** o caso de "usuário nunca clicou em Salvar" (`use-app-studio-hydration.ts`, dispara uma vez se a capa existe mas não tem thumbnail) não passa pelo bulkUpdate — não há `elements` novo pra salvar, só o thumbnail faltando. Mantivemos a rota `/slides/{slideId}/thumbnail`, mas trocada de upload multipart pra `POST` com corpo JSON `{ thumbnail: string }` (`slideThumbnailUpdateSchema`) — `slideService().setThumbnail()` substituiu `generateThumbnail()`, sem buffer/`fileUtils`/`storageService` nenhum.

**Alternativas descartadas:**
- Persistir o SVG como arquivo no R2 (só trocar PNG por SVG, manter storage) — rejeitado: exigiria reescrever a validação de arquivo (magic-byte não serve pra texto) e a lógica de chave/mimeType, pra não ganhar nada sobre guardar o texto direto
- Renderizar via `dangerouslySetInnerHTML` — rejeitado: `data:image/svg+xml` no `<img>` já é seguro por padrão (browser não executa `<script>` de imagem carregada via `<img src>`) e mantém o componente igual ao que já existia
- Migrar/converter thumbnails antigas (URL R2) pro novo formato — desnecessário: `resolveThumbnailSrc` já lida com os dois formatos pelo conteúdo, sem exigir backfill

**Consequências:** rota `/slides/{slideId}/thumbnail` muda de `multipart/form-data` pra `application/json` (`lib/openapi/document.ts` e `slides.http` atualizados). `slideRepository().bulkUpdate()` aceita `thumbnail` opcional por item. `storageService()`/`fileUtils()` continuam existindo (usados em outros lugares, ex: avatares) — só a chamada específica de thumbnail de slide foi removida. Nenhuma migration de schema necessária (`slide.thumbnail` já era `text`).

---

## ADR-017 — `bun patch` em `@excalidraw/excalidraw`: força `shouldUseWorkers = false` (elimina o SecurityError de subsetting de fonte)

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** Console (e overlay de dev do Next) repetia, toda vez que texto era renderizado/exportado no Studio: `SecurityError: Failed to construct 'Worker': Script at 'file:///ROOT/node_modules/@excalidraw/excalidraw/dist/dev/subset-worker.chunk.js' cannot be accessed from origin 'http://localhost:3000'`. Investigação (sessão anterior): o Excalidraw tenta subsetting de fonte via Web Worker (`WorkerPool.create`, `workers.ts`), obtendo a URL do worker a partir de `import.meta.url` de um chunk carregado via `import()` dinâmico. O Turbopack (bundler padrão do Next 16, usado neste projeto) só reescreve `import.meta.url` corretamente pro asset servido quando o padrão `new Worker(new URL(..., import.meta.url))` aparece no mesmo módulo — aqui a URL é computada num chunk e usada em outro, então o Turbopack não reconhece e não reescreve, sobrando um path de build interno (`file:///ROOT/...`) em vez de `http://localhost:3000/_next/...`. O browser recusa construir um Worker com script `file://` a partir de origem `http://` (Same-Origin Policy) → `SecurityError`.

Não é um bug funcional — o próprio Excalidraw já prevê esse tipo de falha (`WorkerUrlNotDefinedError`/`WorkerInTheMainChunkError`, try/catch, flag `shouldUseWorkers` que desliga permanentemente após a primeira falha) e cai pro subsetting no thread principal, que funciona. Mas a falha ainda é *tentada* (e logada) toda vez que uma fonte nova precisa ser subsetada antes da flag desligar — daí o ruído repetido no console/dev overlay.

**Decisão:** usar `bun patch` (nativo do Bun, sem adicionar `patch-package` como dependência) pra forçar `shouldUseWorkers = false` direto na declaração (`dist/dev/chunk-4FTI6OG3.js` e o equivalente minificado em `dist/prod/chunk-K2UTITRG.js`, ambos parte do pacote publicado) — a tentativa de criar o Worker nunca mais acontece, o subsetting já cai direto pro fallback do thread principal (o mesmo caminho que já era usado de qualquer forma), sem log de erro nenhum. Patch registrado em `package.json` (`patchedDependencies`) + `patches/@excalidraw%2Fexcalidraw@0.18.1.patch` — reaplica sozinho em todo `bun install` (confirmado: `rm -rf node_modules/@excalidraw/excalidraw && bun install` reaplicou automaticamente).

**Alternativas descartadas:**
- Ignorar (recomendação inicial) — descartado a pedido explícito: o aviso repetia no console e no overlay de dev do Next com frequência incômoda o suficiente pra pedir eliminação definitiva
- `next.config.ts` (`transpilePackages`, `turbopack.resolveAlias`/`rules`) — não resolve: o problema é o Turbopack não reconhecer o padrão indireto de `new Worker()`, não uma questão de resolução de módulo/alias
- Prop pública do `<Excalidraw>` pra desabilitar workers — não existe (conferido em `dist/types/excalidraw/types.d.ts`, `ExcalidrawProps` não tem nenhum campo relacionado a fonte/subsetting/worker)
- `patch-package` (pacote npm) — descartado em favor do `bun patch` nativo, já que o projeto usa Bun como gerenciador de pacotes; evita dependência extra pro mesmo resultado

**Consequências:** qualquer upgrade de `@excalidraw/excalidraw` que mude o conteúdo desses dois arquivos (nomes de chunk incluem hash de conteúdo — `chunk-4FTI6OG3.js`/`chunk-K2UTITRG.js` provavelmente mudam de nome numa atualização) vai precisar que o patch seja regenerado (`bun patch @excalidraw/excalidraw` → reeditar → `bun patch --commit`) — não é automático entre versões do pacote. Subsetting de fonte roda sempre no thread principal a partir de agora (era o fallback já usado na prática; sem diferença de comportamento visível, só sem a tentativa+erro no meio do caminho).

---

## ADR-018 — `binding-repairer` ganha `frameId` ↔ `children` (mesma classe de bug do ADR-014, elemento `frame`)

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** Studio quebrava ao abrir uma presentation específica (`583daf33-...`, slide de arquitetura com 3 frames "Camada de Apresentação/Negócio/Dados"): `Uncaught TypeError: Cannot read properties of undefined (reading 'forEach')` dentro de `convertToExcalidrawElements`, disparado por `use-app-studio-hydration.ts` — travava a hidratação inteira da presentation, não só um elemento visualmente quebrado.

Inspecionando os dados reais (`slideRepository().findById`): os 3 frames não tinham `children` (`undefined`) — mas os elementos que deveriam pertencer a eles **já tinham `frameId` apontando certinho pro frame correto**. Ou seja: exatamente o mesmo padrão do ADR-014 (a IA emite só uma direção de uma relação bidirecional) — só que aqui é `frameId` (filho→frame) presente e `children` (frame→filhos) ausente, em vez de `containerId`/`boundElements`. `binding-repairer.ts` já existia e já resolvia esse exato problema pra texto/container — só nunca tinha sido estendido pra cobrir frame/children.

**Decisão:** estender `binding-repairer.ts` (não criar um módulo novo) com mais 3 passes: (3) elemento com `frameId` → garante que o frame tem esse id em `children`; (4) frame com `children` → garante que cada filho referenciado tem `frameId` de volta (simetria com o Pass 1/2 já existente); (5) frame que continua sem `children` depois disso (nenhum filho referenciando de volta, ex: frame decorativo vazio) → `children: []`, nunca `undefined` — `convertToExcalidrawElements` sempre espera um array.

**Decisão (dado já quebrado):** corrigido diretamente no banco (mesma abordagem do ADR-014) — lido `slide.elements` da presentation afetada, rodado por `excalidrawSkeleton().normalize()` (Estágio 1, sem context — só a rede de segurança geométrica/estrutural), regravado. Confirmado: os 3 frames ganharam os `children` corretos a partir dos `frameId` já existentes nos filhos (nenhum dado inventado, só a direção que faltava).

**Alternativas descartadas:**
- Criar um normalizador novo baseado em inferência geométrica (calcular quais elementos caem dentro do retângulo do frame) — descartado depois de inspecionar os dados reais: os filhos já tinham `frameId` correto, então é um problema de sincronização bidirecional exato (sem ambiguidade), não uma inferência espacial aproximada
- Só adicionar um fallback `children: []` sem tentar recuperar a relação via `frameId` — perderia a informação de agrupamento que a IA já tinha registrado (mesmo que só numa direção)

**Consequências:** `binding-repairer.test.ts` ganhou 6 casos novos (incluindo a reprodução exata do bug de produção — 3 filhos pro mesmo frame). Suite de testes: 119 → 125. Nenhuma mudança de assinatura pública — `bindingRepairer()` continua retornando só `{ repair }`.

---

## ADR-019 — Studio hidrata slides progressivamente (merge por poll), não mais tudo de uma vez

**Data:** 2026-07  
**Status:** Aceito

**Contexto:** `slideService().generate()` já persiste um slide por vez, em sequência (`slideRepository().create()` logo depois de cada chamada individual ao `slideWorkflow` — nunca em lote). Mas `use-app-studio-hydration.ts` dava poll em `GET /slides` e se recusava a hidratar a store enquanto `rawSlides.length < expectedSlideCount` — ou seja, o dado já existia progressivamente no banco, mas o Studio só mostrava alguma coisa depois que o último slide terminasse. Confirmado com o usuário: mesmo vendo os slides sendo gerados um a um no console/Mastra, a tela ficava em branco até o fim.

**Decisão (store):** `hydrate()` em `app-studio-store.ts` deixou de substituir `slides` inteiro e passou a fazer merge — só adiciona os ids que ainda não existem na store, nunca sobrescreve um slide já presente. Isso é o que permite chamar `hydrate()` a cada poll (não só no final) sem risco de apagar edição ao vivo do usuário (ex: ele já começou a editar a capa enquanto os slides 4-6 ainda geram). `hasHydrated` saiu de dentro de `hydrate()` e virou ação própria (`setHasHydrated`), decidida pelo hook, não mais um efeito colateral do hydrate.

**Decisão (hook):** `use-app-studio-hydration.ts` removeu o gate `if (rawSlides.length < expectedSlideCount) return` antes de hidratar — agora hidrata a cada poll com o que já existe. O gate só continua existindo pra decidir quando marcar `hasHydrated = true` (e por consequência, parar o poll e disparar o fallback de thumbnail da capa).

**Decisão (UI):** nenhuma mudança em `app-presentations-studio-slide-list.tsx`/`app-presentations-studio-canvas.tsx` — ambos já reagiam a `useStudioSlides()`/`useStudioActiveSlide()` do Zustand, então crescer a lista incrementalmente e trocar o canvas do vazio (`EMPTY_SLIDE`) pro primeiro slide real já aconteceu de graça. Único componente novo: badge de progresso ("Gerando slide 3 de 6...") em `app-presentations-studio-slide-list-header.tsx`, usando `useStudioIsWaitingSlides()` (já existia, computado, zero consumidores até agora) + `expectedSlideCount` (novo, exposto pelo provider).

**Alternativas descartadas:**
- Manter `hydrate()` como substituição total, só chamando com mais frequência — descartado: reescreveria por cima de qualquer edição local feita durante a janela de geração (undo history, seleção, elements não salvos do slide ativo)

**Consequências:** `slide.thumbnail`/demais campos de slides já hidratados nunca são atualizados por um poll subsequente enquanto a store já os tem — se o servidor mudar algo num slide já carregado durante essa janela (não deveria acontecer no fluxo de geração inicial), a store não veria até um reload. Aceitável: essa janela é só durante a geração inicial, antes de qualquer edição do usuário ter side-effect no servidor.

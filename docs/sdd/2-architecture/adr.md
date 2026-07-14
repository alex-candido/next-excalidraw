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

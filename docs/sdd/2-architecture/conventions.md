# Conventions

Convenções de organização do projeto em `src/`.

## Visão geral

```
src/
  actions/       cliente HTTP client-side — fetch para as API routes, por entidade
  app/           rotas Next.js App Router
  components/    componentes React reutilizáveis
  config/        configurações de ambiente e roles
  content/       conteúdo MDX das páginas de landing (i18n)
  data/          dados estáticos, mocks, fixtures e JSONs consumíveis pela aplicação
  hooks/         hooks React (react-query, react-hook-form)
  http/          arquivos .http (REST Client VSCode) — documentação executável das API routes
  i18n/          configuração de internacionalização (next-intl)
  lib/           bibliotecas internas e integrações
  middleware/    middlewares Next.js (auth, routing)
  providers/     React context providers
  schemas/       schemas Zod (inputs, outputs, tipos)
  server/        camada server-side: repositories e services
  styles/        CSS global
  tests/         testes unitários
  types/         declarações TypeScript (.d.ts)
```

## Fluxo de responsabilidades

```
Componente React
  └─ actions/          fetch para a API route (client-side)
       └─ app/api/     route.ts — recebe req, valida e delega
            └─ server/services/   orquestra lógica de negócio
                 ├─ server/repositories/   queries Drizzle por entidade (como models do Rails)
                 └─ lib/                   integrações externas (mastra, excalidraw, brevo...)
```

Regras:
- `app/api/route.ts` nunca chama `lib/` ou `repositories/` diretamente — sempre via `services/`
- `services/` nunca fazem `fetch` — usam `repositories/` para banco e `lib/` para integrações
- `actions/` são puramente client-side — apenas `fetch` + tipagem, sem lógica de negócio
- `repositories/` encapsulam todo acesso ao banco — nenhuma query Drizzle fora deles

## src/actions/

Clientes HTTP client-side organizados por entidade. Cada arquivo encapsula os `fetch` para uma entidade da API:

```
actions/
  app/
    presentation-actions.ts   fetch para /api/v1/app/presentations
    outline-actions.ts        fetch para /api/v1/app/outlines
    slide-actions.ts          fetch para /api/v1/app/slides
  admin/
    user-actions.ts           fetch para /api/v1/admin/users
```

Regras:
- Apenas `fetch` + tipagem — sem lógica de negócio
- Retornam o tipo inferido do schema Zod de output da rota

## src/server/

Camada server-side com dois módulos:

```
server/
  repositories/   queries Drizzle por entidade — como models do Rails
  services/       lógica de negócio — orquestra repositories e libs
```

### src/server/repositories/

Cada arquivo encapsula todo acesso ao banco de uma entidade:

```
repositories/
  presentation-repository.ts
  outline-repository.ts
  slide-repository.ts
  user-repository.ts
```

Convenções:
- Funções nomeadas: `findById`, `findMany`, `create`, `update`, `deleteById`
- Recebem e retornam tipos inferidos dos schemas Zod
- Nenhuma lógica de negócio — apenas queries

### src/server/services/

Orquestram repositórios e libs para implementar a lógica de negócio:

```
services/
  presentation-service.ts   ex: cria presentation + dispara outlineWorkflow
  outline-service.ts        ex: persiste outlines após geração
  slide-service.ts          ex: persiste slides após geração
```

Convenções:
- Chamados exclusivamente pelos handlers em `app/api/`
- Podem chamar múltiplos repositories e múltiplas libs
- Não fazem `fetch` — usam libs internas para integrações externas

## src/http/

Arquivos `.http` para o REST Client do VSCode — documentação executável das API routes:

```
http/
  app/
    presentations.http
    outlines.http
    slides.http
  admin/
    users.http
```

Convenções:
- Um arquivo por entidade, espelhando a estrutura de `app/api/`
- Inclui exemplos de request com body, headers e variáveis de ambiente

## src/data/

Dados estáticos consumíveis pela aplicação, organizados por propósito:

- `mocks/` — dados fake para desenvolvimento e testes de componentes
- `fixtures/` — JSONs estáticos usados em testes ou como fallback da aplicação
- Arquivos `.json` avulsos para consumo direto (ex: listas, configurações estáticas)

Regras:
- Seeds do banco ficam em `lib/drizzle/seeds/` — `src/data/` é exclusivo para a camada de aplicação
- Nenhuma lógica aqui — apenas dados estáticos

## src/app/

Rotas Next.js App Router organizadas por route groups com i18n via `[lang]`.

Convenções:
- Cada route group tem `layout.tsx`, `error.tsx` e `loading.tsx` na raiz
- As páginas ficam em `(routes)/` dentro do grupo — evita que o segment apareça na URL
- `dev/` fica fora de `[lang]` — não precisa de i18n
- API routes seguem versionamento: `api/v1/app/` para a área logada e `api/v1/admin/` para o painel
- `route.ts` recebe a request, valida com schema Zod e delega para `server/services/` — sem lógica própria

## src/lib/

Integrações e bibliotecas internas:

```
lib/
  better-auth/    cliente e servidor de autenticação
  brevo/          envio de emails transacionais
    senders/      funções de envio por tipo de email (reset, verificação)
  drizzle/
    schema/       definição das tabelas e enums — source of truth do banco
    migrations/   arquivos SQL gerados pelo drizzle-kit
    seeds/        dados iniciais para dev e prod (por entidade)
  excalidraw/
    generators/
      elements/       funções de criação de cada tipo de elemento (sandbox)
      representations/ geradores de representações visuais completas (flowchart, mindmap, etc.)
    normalize/    normalização de setas (arrows-normalizer)
    parse/        parsing de output bruto do LLM (validateSkeletons, parseSkeletons)
    serialize/    conversão skeleton → ExcalidrawElement (client-side only)
    templates/    elementos pré-montados reutilizáveis para testes e referência
  mastra/
    agents/       definição dos agentes LLM
    prompts/      system prompts de cada agente
    scorers/      avaliadores de qualidade de output
    mappers/      mappers de output dos workflows (ex: workflow-metadata-mapper)
    tools/        tools chamadas pelos agentes via tool call
    workflows/    pipelines de geração (outlineWorkflow, slideWorkflow)
  utils/          utilitários compartilhados por toda a aplicação
```

Regras:
- `lib/drizzle/seeds/` contém seeds do banco — distinto de `src/data/` que é para mocks e fixtures da aplicação
- `lib/excalidraw/serialize/` é client-side only — nunca importar em contexto SSR
- `lib/utils/` é o único lugar para utilitários globais — não criar `utils/` em outros módulos de `lib/`

## src/schemas/

Schemas Zod — source of truth para inputs, outputs e tipos de toda a aplicação. Organizado por contexto (`app/`, `admin/`, `excalidraw/`).

Regras:
- Todo input/output de workflow, API route e server action tem schema Zod aqui — nunca inline
- Enums e constantes associadas a um schema ficam no mesmo arquivo do schema
- Tipos TypeScript são sempre inferidos do Zod (`z.infer<typeof schema>`) — não declarar tipos manualmente
- Enums do banco derivam de `src/lib/drizzle/schema/` — importar de lá, nunca duplicar
- Schemas de tool output (sem metadata) e workflow output (com metadata) são tipos distintos no mesmo arquivo

## src/components/

Componentes React organizados por contexto de rota e domínio.

Subpastas de domínio (`app/`, `admin/`, `auth/`, `landing/`) espelham a estrutura de `src/app/` — componentes de uma página ficam na subpasta correspondente à sua rota.

Subpastas especiais:
- `ui/` — primitivos genéricos (shadcn/ui + extensões). Sem dependência de domínio. `ui/base/` para customizações de primitivos, `ui/blocks/` para composições reutilizáveis
- `layouts/` — shells e estruturas de layout compartilhados entre contextos
- `settings/` — componentes de configuração compartilhados entre `app/` e `admin/`
- `emails/` — templates react-email (server-side)
- `excalidraw/` — componentes que encapsulam o canvas Excalidraw, sempre com `dynamic` import (`ssr: false`)

Regras:
- Componentes de `ui/` não importam de domínio — nunca de `app/`, `admin/`, `actions/`, `hooks/` de domínio
- Componentes de domínio não são importados por outros domínios — `app/` não importa de `admin/` e vice-versa
- Componentes de `excalidraw/` nunca são renderizados no servidor

## src/config/

Configurações de ambiente e roles da aplicação:

- `env-config.ts` — variáveis de ambiente validadas com Zod, falha em build se ausentes
- `roles-config.ts` — definição de roles, permissões e hierarquia de acesso

Regras:
- Todo acesso a `process.env` passa por `env-config.ts` — nunca ler `process.env` direto no código
- Constantes de negócio não ficam aqui — apenas configuração de ambiente e controle de acesso

## src/content/

Conteúdo MDX das páginas de landing, organizado por idioma:

```
content/
  landing/
    en/   conteúdo em inglês
    pt/   conteúdo em português
```

## src/hooks/

Hooks React organizados por domínio. Hooks utilitários genéricos ficam na raiz (ex: `use-mobile.ts`).

Convenções de nomenclatura:
- `use-[entidade].ts` — query/mutation com react-query
- `use-[entidade]-form.ts` — formulário com react-hook-form + zod
- Hooks de domínio específico ficam em subpastas: `hooks/app/`, `hooks/admin/`

Regras:
- Hooks não contêm lógica de negócio — delegam para `actions/` (fetch) ou `lib/` (utilitários)
- Hooks de formulário validam com o schema Zod correspondente de `schemas/`

## src/i18n/

Configuração do `next-intl` com suporte a `pt-BR`, `en-US` e `es`:

- `routing.ts` — locales suportados, locale padrão e estratégia de roteamento
- `request.ts` — carregamento do dicionário por request (server-side)
- `dictionaries.ts` — loader dos arquivos de tradução por locale
- `dictionaries/` — arquivos JSON de tradução por idioma (`pt-BR.json`, `en-US.json`, `es.json`)

Regras:
- Toda string visível ao usuário passa pelos dicionários — sem texto hardcoded em componentes
- Chaves de tradução seguem hierarquia por contexto: `common`, `app`, `admin`, `auth`, `landing`

## src/middleware/

Middlewares Next.js executados no edge, compostos no `middleware.ts` raiz:

- `global-route-middleware.ts` — roteamento por idioma (next-intl) e redirecionamentos globais
- `auth-route-middleware.ts` — proteção de rotas autenticadas, verificação de roles e redirects de auth

Regras:
- Nenhuma lógica de negócio nos middlewares — apenas decisões de roteamento e autenticação
- Middlewares não importam de `lib/`, `server/` ou `schemas/` — operam apenas com request/response

## src/providers/

Context providers organizados por escopo de rota. O `index.tsx` raiz é o provider global que envolve toda a aplicação — compõe os providers de `next/` (query, theme) e demais providers globais.

Convenções:
- `next/` — providers de libs externas (react-query, next-themes)
- `app/` — providers exclusivos da área logada
- `admin/` — providers exclusivos do painel admin
- Providers de escopo mais restrito são compostos dentro do `layout.tsx` do route group correspondente, não no provider raiz

## src/styles/

`globals.css` — único arquivo CSS global. Contém reset, variáveis CSS (tokens de cor, radius, spacing) e configuração do Tailwind v4 + shadcn/ui.

Regras:
- Estilos de componente ficam inline via Tailwind — sem arquivos `.css` por componente
- Exceção: overrides de libs externas que não aceitam Tailwind (ex: `.excalidraw .App-toolbar`)

## src/tests/

Testes unitários com estrutura espelhando `src/`. Atualmente cobre `lib/excalidraw/generators/`.

Convenções:
- Arquivo de teste: `[nome].test.ts` espelhando o caminho do módulo (ex: `tests/lib/excalidraw/generators/arrow-generator.test.ts`)
- Foco em lógica pura — generators, parsers, normalizadores, utilitários
- `tests/tsconfig.json` — configuração TypeScript isolada para o ambiente de testes
- Runner: `bun test`

## src/types/

Declarações TypeScript globais e augmentations de libs externas. Arquivos `.d.ts` na raiz são globais (ex: `mdx.d.ts`, `raw.d.ts`). Subpastas `app/` e `admin/` para tipos de domínio que não derivam de Zod.

Regras:
- Tipos inferidos de Zod ficam em `schemas/` — nunca duplicar aqui
- Usar `.d.ts` apenas para declarações globais ou augmentations de módulos externos
- Tipos de payload de API e workflow ficam em `schemas/` — `types/` é para o que Zod não cobre

## docs/flows/

Fluxos de funcionalidades do projeto. Um arquivo por domínio/funcionalidade:

```
docs/flows/
  outline-generation-flow.md      → pipeline de geração do outline (AI workflow)
  slide-generation-flow.md        → pipeline de geração dos slides (AI workflow)
  excalidraw-flow.md              → lib/excalidraw (parse → normalize → serialize)
  presentation-creation-flow.md   → ciclo completo de criação: API + persistência + redirect
  outline-page-flow.md            → página de revisão e confirmação dos outlines
  editor-flow.md                  → editor Excalidraw por slide (inclui templates e agent chat)
  present-flow.md                 → modo apresentação fullscreen
  single-mode-flow.md             → modalidade Single: prompt, imagem, digitalização (Ciclo 5)
  agent-chat-flow.md              → chat de edição interativa com tools (Ciclo 3)
  collaboration-flow.md           → workgroups, permissões e colaboração em tempo real (Ciclo 5)
  themes-flow.md                  → sistema de temas e personalização visual (Ciclo 4)
  auth-flow.md                    → signup, login, OAuth, reset de senha, proteção de rotas
```

Convenções:
- Nome do arquivo: `[domínio]-flow.md`
- Cada arquivo descreve: entrada, etapas, saída e pontos de atenção
- Sem código — só comportamento esperado
- Criar um novo arquivo sempre que uma funcionalidade nova for implementada

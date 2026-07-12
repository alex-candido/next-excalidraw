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
- Padrão: `function nomeRepository()` com métodos internos e `return {}` no final — acoplamento explícito
- Métodos padrão: `create`, `findById`, `findMany`, `update`, `deleteById`
- Recebem e retornam tipos inferidos dos schemas Drizzle (`$inferInsert`, `$inferSelect`)
- Nenhuma lógica de negócio — apenas queries
- O mesmo padrão se aplica a qualquer módulo de `lib/` que exponha operações de serviço (ex: `elementParser()`, `arrowNormalizer()`, `emailClient()`)
- Exceção: objetos de configuração de framework (Mastra agents, tools, workflows, scorers) são exportados diretamente como constantes — não usam o padrão acoplado

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
      element-generators.ts  função acoplada elementsGenerator() com todos os tipos de elemento
      representations/       geradores de representações visuais completas (flowchart, mindmap, etc.)
    normalize/    normalização de setas — arrowNormalizer() com { normalize }
    parse/        parsing de output bruto do LLM — elementParser() com { parse, validate }
    serialize/    conversão skeleton → ExcalidrawElement — skeletonSerializer() com { serialize } (client-side only)
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

### Metodologia de mapeamento de componentes

Antes de implementar qualquer UI, fazemos o mapeamento estrutural dos componentes da página. O objetivo é definir o **propósito** de cada elemento antes de escrever código.

#### Princípios

**1. Cada elemento significativo é um componente**
Inspirado na filosofia do styled-components: cada elemento da UI que tem um propósito semântico vira um componente nomeado. Sem divs soltas sem propósito estrutural.

**2. Nomenclatura semântica**
O nome descreve o **propósito** do componente, não sua aparência ou posição:
- `LandingHomeHeroAnnouncement` (não `LandingHomeHeroBadge`)
- `LandingHomeHeroSocialProof` (não `LandingHomeHeroDiscovery`)
- `LandingHomeHeroActions` (ok — descreve o propósito)

Padrão: `[Módulo][Página][Section][Propósito]`

**3. Primitivos shadcn/ui**
Todo componente é construído sobre os primitivos do shadcn/ui (`Button`, `Badge`, `Card`, etc.) e os blocks de referência em `docs/sdd/5-references/`. Sem reinventar primitivos.

**4. Atomic Design**
A composição segue a hierarquia:
```
atoms/        → primitivos do shadcn/ui e extensões mínimas
molecules/    → composições simples de atoms
organisms/    → sections completas (ex: LandingHomeHero)
templates/    → estrutura de página com slots
pages/        → instância final com dados reais
```

#### Fluxo de mapeamento

1. **Definir sections da página** — quais blocos existem (hero, features, pricing...)
2. **Definir sub-componentes de cada section** — com propósito semântico claro
3. **Criar skeleton HTML simples** — apenas a estrutura, sem estilização
4. **Depois**: implementar com shadcn/ui + identidade visual

#### Exemplo — `LandingHomeHero`

```tsx
<LandingHomeHero>
  <LandingHomeHeroAnnouncement />  {/* badge de novidade/feature */}
  <LandingHomeHeroTitle />          {/* headline principal */}
  <LandingHomeHeroDescription />    {/* subtítulo */}
  <LandingHomeHeroActions />        {/* CTAs primário e secundário */}
  <LandingHomeHeroSocialProof />    {/* prova social: trial gratuito + nº de orgs */}
</LandingHomeHero>
```

> Identidade visual é fase separada — o mapeamento define estrutura e propósito, não aparência.

#### Padrão de composição de layout

Arquivos de assembly (`*-layout-header.tsx`, `*-layout-footer.tsx`, `layout.tsx`) **não contêm divs anônimas**. Cada wrapper estrutural é um componente nomeado.

A composição usa dois layers:

**Layer 1 — Primitivos estruturais** (`src/components/layouts/`)
Componentes genéricos que definem estrutura e espaçamento, sem conteúdo de domínio:
```
LayoutHeader, LayoutFooter, LayoutMain
LayoutContainer, LayoutSection
LayoutNavBrand, LayoutNavStart, LayoutNavEnd
LayoutNavMenu, LayoutNavActions, LayoutNavCtaMenu, LayoutNavMenuMobile
LayoutFooterColumns, LayoutFooterBottom
```

**Layer 2 — Componentes de conteúdo** (`src/components/landing/`, `src/components/app/`, etc.)
Componentes que carregam o conteúdo real de cada domínio:
```
LandingNavBrand, LandingNavMenu, LandingNavCta, LandingNavMobile
LandingFooterBrand, LandingFooterNav, LandingFooterCopyright
```

O arquivo de assembly compõe os dois layers sem introduzir estrutura própria:

```tsx
// landing-layout-header.tsx — só composição, nenhuma div avulsa
export function LandingLayoutHeader() {
  return (
    <LayoutHeader>
      <LayoutContainer>
        <LayoutNavBrand><LandingNavBrand /></LayoutNavBrand>
        <LayoutNavStart>
          <LayoutNavMenu><LandingNavMenu /></LayoutNavMenu>
        </LayoutNavStart>
        <LayoutNavEnd>
          <LayoutNavActions>
            <LayoutNavCtaMenu><LandingNavCta /></LayoutNavCtaMenu>
          </LayoutNavActions>
          <LayoutNavMenuMobile><LandingNavMobile /></LayoutNavMenuMobile>
        </LayoutNavEnd>
      </LayoutContainer>
    </LayoutHeader>
  );
}
```

Regras:
- Se precisar de um wrapper com classe Tailwind, crie um componente nomeado em `layouts/` — nunca use `<div className="...">` inline em arquivos de assembly
- Primitivos de layout aceitam `className` para overrides pontuais (ex: `<LayoutContainer className="flex-col">`)
- Componentes de conteúdo do Layer 2 podem ter estrutura interna — a restrição se aplica apenas aos arquivos de assembly

---

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

### Responsividade mobile

Dois padrões estabelecidos (ver ADR-007), escolhidos conforme o tipo de diferença entre breakpoints:

**1. Diferença só de apresentação/posição** — variantes puramente CSS via `hidden md:flex` / `flex md:hidden`, sem JS de detecção (ex: `AppLayoutRail`, `AppPresentationsStudioSlideList`/`SlideListMobile`). Evita flash de conteúdo errado durante hidratação, já que a visibilidade é resolvida pelo CSS antes de qualquer JS rodar.

**2. Diferença de comportamento/interação** (não dá pra resolver só com CSS — ex: estratégia de drag-and-drop por eixo, aside docked vs overlay) — usar o hook `useIsMobile()` (`src/hooks/use-mobile.ts`, breakpoint 768px = `md`) pra ramificar em JS. Referência: `ui/sidebar.tsx` e `AppPresentationsStudioPanel` (aside fixo no desktop, `Sheet` no mobile).

Regra: nunca usar `useIsMobile()` quando um `hidden`/`md:hidden` resolveria — só recorrer ao hook quando a branch precisa de lógica JS distinta, não só CSS distinto.

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

Context providers organizados por módulo. Todo contexto fica disponível em qualquer parte da aplicação — não há composição por route group.

```
providers/
  next/       providers de libs externas (react-query, next-themes)
  app/        providers do módulo app (área logada)
    app-provider.tsx                         provider genérico do módulo
    app-presentations-outline-provider.tsx   provider de uma feature específica
    index.tsx                                agrega os dois acima em AppProviders
  admin/      providers do módulo admin (painel)
    admin-provider.tsx
    index.tsx
  index.tsx   agrega app/ + admin/ + next/ em Providers — usado uma única vez em src/app/layout.tsx
```

### Criando um novo provider de contexto

Cada arquivo de provider (`[nome]-provider.tsx`) segue sempre o mesmo formato:

```tsx
"use client";

import { createContext, ReactNode, useContext } from "react";

type XxxContextProps = {
  // shape do contexto — usar `object` como placeholder se ainda não há estado definido
};

const XxxContext = createContext<XxxContextProps | undefined>(undefined);

export const XxxProvider = ({ children }: { children: ReactNode }) => {
  const value: XxxContextProps = {
    // state e funções
  };

  return <XxxContext.Provider value={value}>{children}</XxxContext.Provider>;
};

export const useXxx = () => {
  const context = useContext(XxxContext);
  if (context === undefined) {
    throw new Error("useXxx must be used within an XxxProvider");
  }
  return context;
};
```

Regras:
- Sempre `createContext<T | undefined>(undefined)` — nunca `null` como valor default
- O hook de acesso lança erro explícito (`context === undefined`) se usado fora do provider — nunca retorna um valor parcial/undefined silenciosamente
- Nome do hook é sempre `use` + nome do provider sem o sufixo `Provider` (`AppProvider` → `useApp`, `AppPresentationsOutlineProvider` → `useAppPresentationsOutline`)
- Provider e hook são `const` com arrow function — não `function` declarada
- Cada provider fica em seu próprio arquivo dentro da pasta do módulo (`app/`, `admin/`, etc.) — nunca inline no `index.tsx` do módulo

### Registrando o provider

1. Crie `providers/[módulo]/[nome]-provider.tsx` seguindo o formato acima
2. Importe e componha dentro de `providers/[módulo]/index.tsx` (import relativo, ex: `import { XxxProvider } from "./xxx-provider"`), aninhando dentro do(s) provider(s) já existentes do módulo
3. Não é necessário tocar em `providers/index.tsx` nem em nenhum `layout.tsx` — o módulo (`AppProviders`, `AdminProviders`) já está registrado na raiz uma única vez

Providers específicos de uma feature (ex: estado de uma página) também entram no `index.tsx` do módulo ao qual pertencem — mesmo que usados por uma única rota, eles não recebem props vindas de route params (a rota lê o próprio contexto via hook, sem precisar repassar dados pela árvore de layouts).

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

## docs/sdd/

Documentação de especificação do projeto. Ver `docs/sdd/README.md` para a estrutura completa e regras por tipo de arquivo.

Resumo das localizações relevantes para o desenvolvimento:

```
docs/sdd/
  1-product/           personas, journeys, prd, pm (kanban + decisões)
  2-architecture/      adr, conventions (este arquivo), diagrams/
  3-specs/
    features/          fluxo de cada feature: route → service → repo (*.feature.md)
    pipeline/          internos dos workflows de IA (*.pipeline.md)
    integrations/      integrações externas (*.integration.md)
  4-contracts/         contratos HTTP formais por recurso (*.contract.md)
  5-references/        análise de repositórios de referência
```

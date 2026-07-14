# Feature: Manual Presentation Creation

Criação de uma presentation sem geração AI — o usuário acessa o studio com o canvas vazio e constrói manualmente.

## Contexto

O fluxo principal de criação passa pelo `AppDashboardForm` (`/app/dashboard`): prompt → outline → slides (AI). Esta feature adiciona um caminho alternativo: criação manual via modal, sem prompt e sem geração de conteúdo. O resultado é uma presentation em `status: draft` com zero slides, aberta diretamente no studio.

## Visão geral

```
trigger "+" (AppNavRail · AppDashboardRecentsHeader · AppPresentationsHeader · AppPresentationsEmpty)
        │
        ▼
AppDashboardNewModal
  title (opcional, default "Untitled")
  engine (Excalidraw, locked)
  type (multi | single)
        │
        ▼
POST /api/v1/app/presentations
  { title, type, status: draft }
        │
        ▼
/app/presentations/[id]/studio  ← canvas vazio
```

---

## Modal — AppDashboardNewModal

### Campos

| Campo    | Tipo    | Obrigatório | Default       |
|----------|---------|-------------|---------------|
| `title`  | text    | não         | "Untitled"    |
| `engine` | display | —           | Excalidraw 🔒 |
| `type`   | toggle  | sim         | `multi` (1)   |

### Seção de features (estática)

Abaixo de um separador, bullets fixos (`app.new.features`) descrevendo o canvas Excalidraw.

### Ações

- **Cancelar** — fecha o modal sem criar nada (wired — `DialogClose` + `onCancel`)
- **Criar** — hoje é um `Link` hardcoded pra `/app/presentations/mock/outline` (mock — ainda não dispara `POST /api/v1/app/presentations` nem lê o `title`/`type` do estado local)

---

## Pontos de entrada

Todos abrem o mesmo `AppDashboardNewModal` via estado local (`open`/`onOpenChange`) — cada trigger é dono do seu próprio `useState`, não existe estado global do modal.

### 1. `AppNavRail` (`components/app/app-nav-rail.tsx`)

Botão `+` (`app-nav-rail-new`, ícone `Plus`), fixo no topo do rail, acima dos itens de navegação (Home · Presentations · Templates · Community · Settings).

### 2. `AppDashboardRecentsHeader` (`components/app/dashboard/recents/app-dashboard-recents-header.tsx`)

Botão ao lado do "Ver todas", mesmo padrão do shuffle e view-all.

### 3. `AppPresentationsHeader` (`components/app/presentations/app-presentations-header.tsx`)

Trigger no header da listagem de presentations (`/app/presentations`).

### 4. `AppPresentationsEmpty` (`components/app/presentations/app-presentations-empty.tsx`)

CTA no estado vazio da listagem (sem nenhuma presentation ainda).

---

## Componentes

```
components/app/dashboard/
  app-dashboard-new-modal.tsx           ← Dialog organism (client) — junta title input + engine + type + features + actions
  app-dashboard-new-modal-engine.tsx    ← badge Excalidraw locked (mesmo componente do AppDashboardFormEngine, versão modal)
  app-dashboard-new-modal-type.tsx      ← toggle Multi / Single — ÚNICO campo com estado real (useState no pai, passado via props)
  app-dashboard-new-modal-features.tsx  ← bullets estáticos do Excalidraw
  app-dashboard-new-modal-actions.tsx   ← Cancelar (wired) + Criar (mock, ver acima)
```

Vive em `components/app/dashboard/`, não em `components/app/new/` — mesmo módulo do `AppDashboardForm`, já que ambos os caminhos de criação partem da mesma página (`/app/dashboard`) e dos triggers "+" espalhados pelo app.

---

## API

Reutiliza o endpoint existente `POST /api/v1/app/presentations` sem alterações de schema:

```ts
// Body
{
  title:  string   // valor digitado ou "Untitled"
  type:   number   // 0=single · 1=multi
  // demais campos omitidos → usam defaults do banco
}
```

```ts
// Response HTTP 201
{
  presentationId: string
  type:           number
}
```

O frontend deve redirecionar para `/app/presentations/${presentationId}/studio` (hoje redireciona pra um path mock, ver "Ações" acima).

---

## Impactos

### Schema

Nenhuma alteração necessária. `userPrompt` já é nullable; `title` recebe "Untitled" como fallback; `status` default é `draft (0)`.

### Studio (`presentations/[id]/studio`)

O studio precisa tratar `slides = []` — presentation recém-criada manualmente não tem slides. Isso já é um requisito independente desta feature (qualquer presentation em `draft` pode não ter slides).

### presentation-creation.feature.md

Documenta os dois caminhos de criação: AI-generated e manual — ver seção "Etapa 1" de lá para o mapeamento do `AppDashboardForm`.

---

## Fora do escopo

- Nenhum campo de `aspectRatio`, `language` ou `theme` no modal — defaults do banco são suficientes para o MVP manual
- Sem validação de título mínimo — "Untitled" é sempre um fallback válido
- Sem geração de outline ou slides neste fluxo

---

## Pendências de integração (estado atual — tudo mock)

- `app-dashboard-new-modal.tsx` — título não tem `useState`/`onChange`, valor nunca é lido
- `app-dashboard-new-modal-actions.tsx` — botão "Criar" é um `Link` hardcoded pra `/app/presentations/mock/outline`, não chama `presentationActions().create()`/`useAppPresentation().useCreate()`
- Nenhum dos 4 triggers passa dados adicionais pro modal — hoje é só `open`/`onOpenChange`

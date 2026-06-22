# Feature: Manual Presentation Creation

Criação de uma presentation sem geração AI — o usuário acessa o editor com o canvas vazio e constrói manualmente.

## Contexto

O fluxo principal de criação passa pelo `AppDashboardForm`: prompt → outline → slides (AI). Esta feature adiciona um caminho alternativo: criação manual via modal, sem prompt e sem geração de conteúdo. O resultado é uma presentation em `status: draft` com zero slides, aberta diretamente no editor.

## Visão geral

```
trigger "+" (AppNavMenu ou AppDashboardRecents header)
        │
        ▼
AppNewPresentationModal
  title (opcional, default "Untitled")
  engine (Excalidraw, locked)
  type (multi | single)
        │
        ▼
POST /api/v1/app/presentations
  { title, type, status: draft }
        │
        ▼
/app/presentations/[id]/editor  ← canvas vazio
```

---

## Modal — AppNewPresentationModal

### Campos

| Campo    | Tipo    | Obrigatório | Default       |
|----------|---------|-------------|---------------|
| `title`  | text    | não         | "Untitled"    |
| `engine` | display | —           | Excalidraw 🔒 |
| `type`   | toggle  | sim         | `multi` (1)   |

### Seção de features (estática)

Abaixo de um separador, 3 bullets fixos descrevendo o canvas Excalidraw:
- "An AI-powered all-in-one diagram platform"
- "A polished whiteboard tool with a clean, intuitive hand-drawn style"
- "Free-form drawing with shapes, arrows, text, and more"

### Ações

- **Cancelar** — fecha o modal sem criar nada
- **Criar** — submete e redireciona para o editor

---

## Pontos de entrada

### 1. AppNavMenu

Novo `SidebarMenuItem` com botão `+` (ícone `Plus`) dentro do `SidebarMenu`, posicionado abaixo dos itens de navegação existentes (Home · Presentations · Settings). Abre o modal via estado local.

### 2. AppDashboardRecents header

Terceiro botão ao lado do "Ver todas" — `Button variant="outline" size="sm"` com ícone `Plus`, mesmo padrão do shuffle e view-all. Abre o mesmo modal.

---

## Componentes

```
components/app/new/
  app-new-presentation-modal.tsx           ← Dialog organism (client)
  app-new-presentation-modal-engine.tsx    ← badge Excalidraw locked
  app-new-presentation-modal-type.tsx      ← toggle Multi / Single
  app-new-presentation-modal-features.tsx  ← 3 bullets Excalidraw
  app-new-presentation-modal-actions.tsx   ← Cancelar + Criar
```

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

O frontend redireciona para `/app/presentations/${presentationId}/editor`.

---

## Impactos

### Schema

Nenhuma alteração necessária. `userPrompt` já é nullable; `title` recebe "Untitled" como fallback; `status` default é `draft (0)`.

### Editor (`presentations/[id]/editor`)

O editor precisa tratar `slides = []` — presentation recém-criada manualmente não tem slides. Isso já é um requisito independente desta feature (qualquer presentation em `draft` pode não ter slides).

### Diagrama lógico

Nova ramificação no fluxo de criação:

```
/app/dashboard
  ├─ AppDashboardForm (com prompt) → outline → slides → editor
  └─ AppNewPresentationModal (+)   → editor (canvas vazio)
```

### presentation-creation.feature.md

Atualizar para documentar os dois caminhos de criação: AI-generated e manual.

---

## Fora do escopo

- Nenhum campo de `aspectRatio`, `language` ou `theme` no modal — defaults do banco são suficientes para o MVP manual
- Sem validação de título mínimo — "Untitled" é sempre um fallback válido
- Sem geração de outline ou slides neste fluxo

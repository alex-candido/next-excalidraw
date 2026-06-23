# App Presentations & Community Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalizar o mapeamento de `/app/presentations` com suporte a lixeira e favoritos, e refatorar `AppCommunityDuplicateModal` em um modal com navegação interna (duplicate ↔ author profile).

**Architecture:** Três frentes independentes. Trash: toggle de view no `AppPresentations` com header condicional e toolbar separada. Favorites: prop `isFavorited` no card com star overlay. Community modal: shell `AppCommunityModal` com `ModalView` discriminada, dois view-components intercambiáveis, navegação sem empilhamento de dialogs.

**Tech Stack:** Next.js App Router, React, shadcn/ui (Dialog, Avatar, Button, Badge, Carousel, DropdownMenu), next-intl, lucide-react, Tailwind CSS v4.

## Global Constraints

- Nomenclatura: `[Módulo][Página][Section][Propósito]`, ex: `AppPresentationCardFavorite`
- Nenhuma `<div>` anônima em arquivos de assembly — todo wrapper estrutural é componente nomeado
- Sem lógica de negócio — apenas estado visual (fase de mapeamento)
- Strings visíveis ao usuário sempre via dicionários i18n (pt-BR, en-US, es)
- Classes BEM-like em cada wrapper: `app-presentation-card-favorite`, etc.
- Imports de `@/components/ui/` apenas — sem reinventar primitivos
- `"use client"` apenas quando há `useState` / `useEffect` / event handlers

---

### Task 1: i18n — novas chaves em app-presentations e app-community

**Files:**
- Modify: `src/i18n/dictionaries/en-US/app-presentations.json`
- Modify: `src/i18n/dictionaries/pt-BR/app-presentations.json`
- Modify: `src/i18n/dictionaries/es/app-presentations.json`
- Modify: `src/i18n/dictionaries/en-US/app-community.json`
- Modify: `src/i18n/dictionaries/pt-BR/app-community.json`
- Modify: `src/i18n/dictionaries/es/app-community.json`

**Interfaces:**
- Produces: chaves `app.presentations.card.actions.{unfavorite,restore,deletePermanently}`, `app.presentations.header.{trash,back}`, `app.presentations.trash.modal.*`, `app.presentations.trash.toolbar.*`, `app.presentations.trash.empty.label`, `app.community.modal.{duplicate,view,back,close,author.presentations}`

- [ ] **Step 1: Substituir `src/i18n/dictionaries/en-US/app-presentations.json`**

```json
{
  "app": {
    "presentations": {
      "hero": {
        "title": "Your presentations",
        "description": "Manage and access all your presentations and diagrams."
      },
      "header": {
        "title": "All",
        "trash": "Trash",
        "back": "Back"
      },
      "toolbar": {
        "search": "Search presentations...",
        "searchTrigger": "Search",
        "searchEmpty": "No results found.",
        "filters": {
          "all": "All",
          "recent": "Recently viewed",
          "mine": "Created by you",
          "favorites": "Favorites"
        }
      },
      "card": {
        "meta": {
          "created": "Created on {date} · by {author}"
        },
        "actions": {
          "menu": "More options",
          "share": "Share",
          "rename": "Rename",
          "favorite": "Add to favorites",
          "unfavorite": "Remove from favorites",
          "duplicate": "Duplicate",
          "copyLink": "Copy link",
          "trash": "Move to trash",
          "restore": "Restore",
          "deletePermanently": "Delete permanently"
        }
      },
      "trash": {
        "modal": {
          "title": "Move to trash?",
          "description": "You can restore this presentation from the trash at any time.",
          "confirm": "Move to trash"
        },
        "toolbar": {
          "restoreAll": "Restore all",
          "empty": "Empty trash"
        },
        "empty": {
          "label": "The trash is empty."
        }
      },
      "empty": {
        "label": "No presentations yet."
      },
      "types": {
        "multi": "Presentation",
        "single": "Diagram"
      }
    }
  }
}
```

- [ ] **Step 2: Substituir `src/i18n/dictionaries/pt-BR/app-presentations.json`**

```json
{
  "app": {
    "presentations": {
      "hero": {
        "title": "Suas apresentações",
        "description": "Gerencie e acesse todas as suas apresentações e diagramas."
      },
      "header": {
        "title": "Todas",
        "trash": "Lixeira",
        "back": "Voltar"
      },
      "toolbar": {
        "search": "Buscar apresentações...",
        "searchTrigger": "Buscar",
        "searchEmpty": "Nenhum resultado encontrado.",
        "filters": {
          "all": "Todos",
          "recent": "Vistos recentemente",
          "mine": "Criados por você",
          "favorites": "Favoritos"
        }
      },
      "card": {
        "meta": {
          "created": "Criado em {date} · por {author}"
        },
        "actions": {
          "menu": "Mais opções",
          "share": "Compartilhar",
          "rename": "Renomear",
          "favorite": "Adicionar aos favoritos",
          "unfavorite": "Remover dos favoritos",
          "duplicate": "Duplicar",
          "copyLink": "Copiar link",
          "trash": "Mover para lixeira",
          "restore": "Restaurar",
          "deletePermanently": "Excluir permanentemente"
        }
      },
      "trash": {
        "modal": {
          "title": "Mover para a lixeira?",
          "description": "Você pode restaurar esta apresentação da lixeira a qualquer momento.",
          "confirm": "Mover para lixeira"
        },
        "toolbar": {
          "restoreAll": "Restaurar todas",
          "empty": "Esvaziar lixeira"
        },
        "empty": {
          "label": "A lixeira está vazia."
        }
      },
      "empty": {
        "label": "Nenhuma apresentação ainda."
      },
      "types": {
        "multi": "Apresentação",
        "single": "Diagrama"
      }
    }
  }
}
```

- [ ] **Step 3: Substituir `src/i18n/dictionaries/es/app-presentations.json`**

```json
{
  "app": {
    "presentations": {
      "hero": {
        "title": "Tus presentaciones",
        "description": "Gestiona y accede a todas tus presentaciones y diagramas."
      },
      "header": {
        "title": "Todas",
        "trash": "Papelera",
        "back": "Volver"
      },
      "toolbar": {
        "search": "Buscar presentaciones...",
        "searchTrigger": "Buscar",
        "searchEmpty": "No se encontraron resultados.",
        "filters": {
          "all": "Todos",
          "recent": "Vistos recientemente",
          "mine": "Creados por ti",
          "favorites": "Favoritos"
        }
      },
      "card": {
        "meta": {
          "created": "Creado el {date} · por {author}"
        },
        "actions": {
          "menu": "Más opciones",
          "share": "Compartir",
          "rename": "Renombrar",
          "favorite": "Agregar a favoritos",
          "unfavorite": "Quitar de favoritos",
          "duplicate": "Duplicar",
          "copyLink": "Copiar enlace",
          "trash": "Mover a la papelera",
          "restore": "Restaurar",
          "deletePermanently": "Eliminar permanentemente"
        }
      },
      "trash": {
        "modal": {
          "title": "¿Mover a la papelera?",
          "description": "Puedes restaurar esta presentación desde la papelera en cualquier momento.",
          "confirm": "Mover a la papelera"
        },
        "toolbar": {
          "restoreAll": "Restaurar todo",
          "empty": "Vaciar papelera"
        },
        "empty": {
          "label": "La papelera está vacía."
        }
      },
      "empty": {
        "label": "Aún no hay presentaciones."
      },
      "types": {
        "multi": "Presentación",
        "single": "Diagrama"
      }
    }
  }
}
```

- [ ] **Step 4: Adicionar chave `modal` em `src/i18n/dictionaries/en-US/app-community.json`**

Adicionar ao objeto `app.community` existente:

```json
"modal": {
  "duplicate": "Duplicate to my collection",
  "view": "View",
  "back": "Back",
  "close": "Close",
  "author": {
    "presentations": "Public presentations"
  }
}
```

- [ ] **Step 5: Adicionar chave `modal` em `src/i18n/dictionaries/pt-BR/app-community.json`**

```json
"modal": {
  "duplicate": "Duplicar para minha coleção",
  "view": "Visualizar",
  "back": "Voltar",
  "close": "Fechar",
  "author": {
    "presentations": "Apresentações públicas"
  }
}
```

- [ ] **Step 6: Adicionar chave `modal` em `src/i18n/dictionaries/es/app-community.json`**

```json
"modal": {
  "duplicate": "Duplicar a mi colección",
  "view": "Ver",
  "back": "Volver",
  "close": "Cerrar",
  "author": {
    "presentations": "Presentaciones públicas"
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add src/i18n/dictionaries/
git commit -m "feat: add i18n keys for trash, favorites and community modal navigation"
```

---

### Task 2: AppPresentationCardActions — novos action keys e isFavorited

**Files:**
- Modify: `src/components/app/app-presentation-card-actions.tsx`

**Interfaces:**
- Consumes: `AppPresentationTrashModal` de `@/components/app/presentations/app-presentation-trash-modal` (criado na Task 5 — implementar Tasks 2–4 primeiro, importar na Task 5)
- Produces: `PresentationActionKey` com `"restore"` e `"deletePermanently"`, `TRASH_VIEW_ACTIONS`, prop `isFavorited?: boolean`, prop `onTrashConfirm?: () => void`

- [ ] **Step 1: Substituir o conteúdo completo de `app-presentation-card-actions.tsx`**

```tsx
"use client";

import { Copy, Link, MoreHorizontal, Pencil, RotateCcw, Share2, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { AppPresentationTrashModal } from "@/components/app/presentations/app-presentation-trash-modal";

export type PresentationActionKey =
  | "share"
  | "rename"
  | "favorite"
  | "duplicate"
  | "copyLink"
  | "trash"
  | "restore"
  | "deletePermanently";

export const DEFAULT_PRESENTATION_ACTIONS: PresentationActionKey[] = [
  "share",
  "rename",
  "favorite",
  "duplicate",
  "copyLink",
  "trash",
];

export const TRASH_VIEW_ACTIONS: PresentationActionKey[] = [
  "restore",
  "deletePermanently",
];

const MAIN_ACTIONS: PresentationActionKey[] = [
  "share",
  "rename",
  "favorite",
  "duplicate",
  "copyLink",
  "restore",
];

const DESTRUCTIVE_ACTIONS: PresentationActionKey[] = ["trash", "deletePermanently"];

const ACTION_ICON: Record<PresentationActionKey, React.ElementType> = {
  share: Share2,
  rename: Pencil,
  favorite: Star,
  duplicate: Copy,
  copyLink: Link,
  trash: Trash2,
  restore: RotateCcw,
  deletePermanently: X,
};

interface AppPresentationCardActionsProps {
  title: string;
  createdAtLabel: string;
  createdBy: string;
  actions?: PresentationActionKey[];
  isFavorited?: boolean;
  onTrashConfirm?: () => void;
  className?: string;
}

export function AppPresentationCardActions({
  title,
  createdAtLabel,
  createdBy,
  actions = DEFAULT_PRESENTATION_ACTIONS,
  isFavorited = false,
  onTrashConfirm,
  className,
}: AppPresentationCardActionsProps) {
  const t = useTranslations("app.presentations.card");
  const [trashModalOpen, setTrashModalOpen] = useState(false);

  const mainActions = MAIN_ACTIONS.filter((k) => actions.includes(k));
  const destructiveActions = DESTRUCTIVE_ACTIONS.filter((k) => actions.includes(k));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "app-presentation-card-actions-trigger flex size-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-opacity hover:opacity-80",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
          aria-label={t("actions.menu")}
        >
          <MoreHorizontal className="size-3.5" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="app-presentation-card-actions-content w-56"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="app-presentation-card-actions-header flex flex-col gap-0.5 px-2 py-1.5">
            <span className="app-presentation-card-actions-header-title truncate text-sm font-medium text-foreground">
              {title}
            </span>
            <span className="app-presentation-card-actions-header-meta text-xs text-muted-foreground">
              {t("meta.created", { date: createdAtLabel, author: createdBy })}
            </span>
          </div>

          <DropdownMenuSeparator />

          {mainActions.length > 0 && (
            <DropdownMenuGroup>
              {mainActions.map((key) => {
                const Icon = ACTION_ICON[key];
                const isFavoriteKey = key === "favorite";
                return (
                  <DropdownMenuItem
                    key={key}
                    className={`app-presentation-card-actions-${key} gap-2`}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        isFavoriteKey && isFavorited && "fill-yellow-500 text-yellow-500",
                      )}
                    />
                    {isFavoriteKey
                      ? t(isFavorited ? "actions.unfavorite" : "actions.favorite")
                      : t(`actions.${key}`)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          )}

          {destructiveActions.length > 0 && (
            <>
              {mainActions.length > 0 && <DropdownMenuSeparator />}
              {destructiveActions.map((key) => {
                const Icon = ACTION_ICON[key];
                return (
                  <DropdownMenuItem
                    key={key}
                    className={`app-presentation-card-actions-${key} gap-2 text-destructive focus:text-destructive`}
                    onClick={key === "trash" ? () => setTrashModalOpen(true) : undefined}
                  >
                    <Icon className="size-4" />
                    {t(`actions.${key}`)}
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {actions.includes("trash") && (
        <AppPresentationTrashModal
          open={trashModalOpen}
          onOpenChange={setTrashModalOpen}
          title={title}
          onConfirm={onTrashConfirm}
        />
      )}
    </>
  );
}
```

> Nota: a importação de `AppPresentationTrashModal` ficará com erro de módulo até a Task 5 ser concluída. Isso é esperado — crie o arquivo na Task 5 e o erro desaparecerá.

---

### Task 3: AppPresentationCardFavorite — star overlay

**Files:**
- Create: `src/components/app/app-presentation-card-favorite.tsx`

**Interfaces:**
- Produces: `AppPresentationCardFavorite` (sem props obrigatórias além de `className?`)

- [ ] **Step 1: Criar `src/components/app/app-presentation-card-favorite.tsx`**

```tsx
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function AppPresentationCardFavorite({
  className,
}: {
  className?: string;
}) {
  return (
    <Star
      className={cn(
        "app-presentation-card-favorite size-3 shrink-0 fill-yellow-400 text-yellow-400",
        className,
      )}
    />
  );
}
```

---

### Task 4: AppPresentationCard — prop isFavorited

**Files:**
- Modify: `src/components/app/app-presentation-card.tsx`

**Interfaces:**
- Consumes: `AppPresentationCardFavorite` (Task 3), `isFavorited?: boolean` e `onTrashConfirm?: () => void` no `AppPresentationCardActions` (Task 2)
- Produces: prop `isFavorited?: boolean` e `onTrashConfirm?: () => void` em `AppPresentationCardProps`

- [ ] **Step 1: Adicionar imports e props**

No topo do arquivo, adicionar import:
```tsx
import { AppPresentationCardFavorite } from "@/components/app/app-presentation-card-favorite";
```

Adicionar ao tipo `AppPresentationCardProps` (antes do union):
```tsx
isFavorited?: boolean;
onTrashConfirm?: () => void;
```

- [ ] **Step 2: Passar `isFavorited` e `onTrashConfirm` para `AppPresentationCardActions`**

Localizar a chamada de `AppPresentationCardActions` no JSX e adicionar as props:
```tsx
<AppPresentationCardActions
  title={title}
  createdAtLabel={createdAtLabel}
  createdBy={createdBy}
  actions={actions}
  isFavorited={isFavorited}
  onTrashConfirm={onTrashConfirm}
/>
```

- [ ] **Step 3: Renderizar a estrela no overlay, ao lado do título**

Localizar o bloco `app-presentation-card-info` e substituir:

```tsx
<div className="app-presentation-card-info flex min-w-0 flex-col gap-0.5">
  <div className="flex items-center gap-1.5">
    {isFavorited && <AppPresentationCardFavorite />}
    <span className="app-presentation-card-title truncate text-sm font-medium leading-snug text-white">
      {title}
    </span>
  </div>
  <span className="app-presentation-card-meta text-xs text-white/60">
    {type === PresentationType.multi && slideCount && slideCount > 0
      ? `${slideCount} slides · ${createdAtLabel}`
      : createdAtLabel}
  </span>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/app/app-presentation-card-favorite.tsx \
        src/components/app/app-presentation-card.tsx \
        src/components/app/app-presentation-card-actions.tsx
git commit -m "feat: add isFavorited state to presentation card and star overlay"
```

---

### Task 5: AppPresentationTrashModal — dialog de confirmação

**Files:**
- Create: `src/components/app/presentations/app-presentation-trash-modal.tsx`

**Interfaces:**
- Consumes: `app.presentations.trash.modal.*` e `app.new.actions.cancel` (i18n — Task 1)
- Produces: `AppPresentationTrashModal({ open, onOpenChange, title, onConfirm? })`

- [ ] **Step 1: Criar `src/components/app/presentations/app-presentation-trash-modal.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppPresentationTrashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onConfirm?: () => void;
}

export function AppPresentationTrashModal({
  open,
  onOpenChange,
  title,
  onConfirm,
}: AppPresentationTrashModalProps) {
  const t = useTranslations("app.presentations.trash.modal");
  const tActions = useTranslations("app.new.actions");

  function handleConfirm() {
    onConfirm?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-presentation-trash-modal sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription className="truncate">{title}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" size="sm" />}>
            {tActions("cancel")}
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            className="app-presentation-trash-modal-confirm"
            onClick={handleConfirm}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Task 6: AppPresentationsTrashToolbar — bulk actions da lixeira

**Files:**
- Create: `src/components/app/presentations/app-presentations-trash-toolbar.tsx`

**Interfaces:**
- Consumes: `app.presentations.trash.toolbar.*` (i18n — Task 1)
- Produces: `AppPresentationsTrashToolbar({ onRestoreAll?, onEmptyTrash? })`

- [ ] **Step 1: Criar `src/components/app/presentations/app-presentations-trash-toolbar.tsx`**

```tsx
"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppPresentationsTrashToolbarProps {
  onRestoreAll?: () => void;
  onEmptyTrash?: () => void;
  className?: string;
}

export function AppPresentationsTrashToolbar({
  onRestoreAll,
  onEmptyTrash,
  className,
}: AppPresentationsTrashToolbarProps) {
  const t = useTranslations("app.presentations.trash.toolbar");

  return (
    <div
      className={cn(
        "app-presentations-trash-toolbar flex items-center gap-2",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="app-presentations-trash-toolbar-restore gap-1.5 text-xs"
        onClick={onRestoreAll}
      >
        <RotateCcw className="size-3.5" />
        {t("restoreAll")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="app-presentations-trash-toolbar-empty gap-1.5 text-xs text-destructive hover:text-destructive"
        onClick={onEmptyTrash}
      >
        <Trash2 className="size-3.5" />
        {t("empty")}
      </Button>
    </div>
  );
}
```

---

### Task 7: AppPresentationsHeader — trash toggle

**Files:**
- Modify: `src/components/app/presentations/app-presentations-header.tsx`

**Interfaces:**
- Consumes: `app.presentations.header.{title,trash,back}` (i18n — Task 1)
- Produces: props adicionais `trashCount?: number`, `isTrashView?: boolean`, `onTrashToggle?: () => void`

- [ ] **Step 1: Substituir o conteúdo completo de `app-presentations-header.tsx`**

```tsx
"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AppDashboardNewModal } from "@/components/app/dashboard/app-dashboard-new-modal";
import { AppPresentationsSearch } from "@/components/app/app-presentations-search";

interface AppPresentationsHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  trashCount?: number;
  isTrashView?: boolean;
  onTrashToggle?: () => void;
}

export function AppPresentationsHeader({
  trashCount = 0,
  isTrashView = false,
  onTrashToggle,
  className,
  ...props
}: AppPresentationsHeaderProps) {
  const t = useTranslations("app.presentations.header");
  const tNew = useTranslations("app.new");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "app-presentations-header flex items-center justify-between gap-4",
          className,
        )}
        {...props}
      >
        {isTrashView ? (
          <div className="app-presentations-header-trash-nav flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="app-presentations-header-back -ml-2 gap-1.5 text-xs"
              onClick={onTrashToggle}
            >
              <ArrowLeft className="size-3.5" />
              {t("back")}
            </Button>
            <span className="app-presentations-header-trash-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("trash")}
            </span>
          </div>
        ) : (
          <>
            <span className="app-presentations-header-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("title")}
            </span>
            <div className="app-presentations-header-actions flex items-center gap-1.5">
              <AppPresentationsSearch />
              {trashCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="app-presentations-header-trash shrink-0 gap-1.5 text-xs text-muted-foreground"
                  onClick={onTrashToggle}
                >
                  <Trash2 className="size-3.5" />
                  <Badge
                    variant="secondary"
                    className="rounded-full px-1.5 py-0 text-xs"
                  >
                    {trashCount}
                  </Badge>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="app-presentations-header-new shrink-0 gap-1.5 text-xs"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">{tNew("trigger")}</span>
              </Button>
            </div>
          </>
        )}
      </div>

      {!isTrashView && (
        <AppDashboardNewModal open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </>
  );
}
```

---

### Task 8: AppPresentations — view de lixeira

**Files:**
- Modify: `src/components/app/presentations/app-presentations.tsx`

**Interfaces:**
- Consumes: `TRASH_VIEW_ACTIONS` de `app-presentation-card-actions` (Task 2), `AppPresentationsTrashToolbar` (Task 6), `AppPresentationsHeader` com novas props (Task 7), `app.presentations.trash.empty.label` (Task 1)
- Produces: componente com estado `isTrashView` e mock `TRASH_ITEMS`

- [ ] **Step 1: Substituir o conteúdo completo de `app-presentations.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import {
  PresentationLanguage,
  PresentationType,
} from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import { TRASH_VIEW_ACTIONS } from "@/components/app/app-presentation-card-actions";
import { AppPresentationsEmpty } from "@/components/app/presentations/app-presentations-empty";
import { AppPresentationsHeader } from "@/components/app/presentations/app-presentations-header";
import { AppPresentationsToolbar } from "@/components/app/presentations/app-presentations-toolbar";
import { AppPresentationsTrashToolbar } from "@/components/app/presentations/app-presentations-trash-toolbar";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  {
    id: "1",
    title: "Fluxo de autenticação com login social",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 8,
    createdAtLabel: "há 2 dias",
    createdBy: "Alex C.",
    isFavorited: true,
  },
  {
    id: "2",
    title: "Arquitetura de microsserviços com API gateway",
    type: PresentationType.single,
    language: PresentationLanguage.en,
    slideCount: 1,
    createdAtLabel: "há 5 dias",
    createdBy: "Alex C.",
    isFavorited: false,
  },
  {
    id: "3",
    title: "Roadmap Q3 — Produto e Entregas",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 12,
    createdAtLabel: "há 1 semana",
    createdBy: "Alex C.",
    isFavorited: false,
  },
];

const TRASH_ITEMS = [
  {
    id: "t1",
    title: "Apresentação de produto antiga",
    type: PresentationType.multi,
    language: PresentationLanguage.ptBR,
    slideCount: 5,
    createdAtLabel: "há 3 semanas",
    createdBy: "Alex C.",
    isFavorited: false,
  },
];

export function AppPresentations({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.presentations");
  const [isTrashView, setIsTrashView] = useState(false);

  const currentItems = isTrashView ? TRASH_ITEMS : ITEMS;

  return (
    <LayoutSection className="md:pb-16">
      <LayoutContainer className="justify-center">
        <div
          className={cn(
            "app-presentations w-full max-w-4xl flex flex-col gap-4",
            className,
          )}
          {...props}
        >
          <AppPresentationsHeader
            trashCount={TRASH_ITEMS.length}
            isTrashView={isTrashView}
            onTrashToggle={() => setIsTrashView((v) => !v)}
          />

          {isTrashView ? (
            <AppPresentationsTrashToolbar />
          ) : (
            <AppPresentationsToolbar />
          )}

          {currentItems.length === 0 ? (
            isTrashView ? (
              <div className="app-presentations-trash-empty flex flex-col items-center gap-4 py-16 text-center">
                <span className="text-sm text-muted-foreground">
                  {t("trash.empty.label")}
                </span>
              </div>
            ) : (
              <AppPresentationsEmpty />
            )
          ) : (
            <div className="app-presentations-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((item) => (
                <AppPresentationCard
                  key={item.id}
                  title={item.title}
                  type={item.type}
                  language={item.language}
                  slideCount={item.slideCount}
                  typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                  createdAtLabel={item.createdAtLabel}
                  createdBy={item.createdBy}
                  isFavorited={item.isFavorited}
                  actions={isTrashView ? TRASH_VIEW_ACTIONS : undefined}
                  {...(isTrashView
                    ? { onSelect: () => {} }
                    : { href: `/app/presentations/${item.id}/studio` })}
                />
              ))}
            </div>
          )}
        </div>
      </LayoutContainer>
    </LayoutSection>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/app/presentations/
git commit -m "feat: add trash view and favorites star to presentations"
```

---

### Task 9: AppCommunityModalDuplicateView — extração do modal atual

**Files:**
- Create: `src/components/app/app-community-modal-duplicate-view.tsx`

**Interfaces:**
- Consumes: `app.community.modal.{duplicate,view}` e `app.new.actions.cancel` (i18n — Task 1)
- Produces: `AppCommunityModalDuplicateView({ title, typeLabel, createdAtLabel, createdBy, onAuthorClick? })`

- [ ] **Step 1: Criar `src/components/app/app-community-modal-duplicate-view.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SLIDE_COUNT = 5;

interface AppCommunityModalDuplicateViewProps {
  title: string;
  typeLabel: string;
  createdAtLabel: string;
  createdBy: string;
  onAuthorClick?: () => void;
  className?: string;
}

export function AppCommunityModalDuplicateView({
  title,
  typeLabel,
  createdAtLabel,
  createdBy,
  onAuthorClick,
  className,
}: AppCommunityModalDuplicateViewProps) {
  const t = useTranslations("app.community.modal");
  const tActions = useTranslations("app.new.actions");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const handler = () => setCurrent(api.selectedScrollSnap());
    api.on("select", handler);
    return () => {
      api.off("select", handler);
    };
  }, [api]);

  return (
    <div className={cn("app-community-modal-duplicate-view", className)}>
      <div className="app-community-modal-duplicate-thumb flex flex-col">
        <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
          <CarouselContent className="ml-0">
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <CarouselItem key={i} className="pl-0">
                <div className="aspect-video w-full bg-muted" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex items-center justify-between border-b bg-background px-4 py-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {current + 1} / {SLIDE_COUNT}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <button
                key={i}
                className={cn(
                  "rounded-full bg-foreground/20 transition-all hover:bg-foreground/40",
                  i === current ? "size-2 bg-foreground/80" : "size-1.5",
                )}
                onClick={() => api?.scrollTo(i)}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="app-community-modal-duplicate-body flex flex-col gap-3 p-4">
        <div className="app-community-modal-duplicate-info flex flex-col gap-1.5">
          <span className="app-community-modal-duplicate-title text-base font-semibold leading-snug">
            {title}
          </span>
          <div className="app-community-modal-duplicate-meta flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="app-community-modal-duplicate-type rounded-full text-xs"
            >
              {typeLabel}
            </Badge>
            <button
              className="app-community-modal-duplicate-author text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
              onClick={onAuthorClick}
            >
              {createdBy}
            </button>
            <span className="app-community-modal-duplicate-date text-xs text-muted-foreground">
              · {createdAtLabel}
            </span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" size="sm" />}>
            {tActions("cancel")}
          </DialogClose>
          <Button
            variant="outline"
            size="sm"
            className="app-community-modal-duplicate-view-btn gap-1.5"
          >
            {t("view")}
          </Button>
          <Button
            size="sm"
            className="app-community-modal-duplicate-action gap-1.5"
          >
            <Copy className="size-3.5" />
            {t("duplicate")}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
```

---

### Task 10: AppCommunityModalAuthorView — perfil do autor

**Files:**
- Create: `src/components/app/app-community-modal-author-view.tsx`

**Interfaces:**
- Consumes: `AppPresentationCard` (Tasks 2–4), `Avatar/AvatarImage/AvatarFallback` de `@/components/ui/avatar`, `app.community.modal.{close,author.presentations}` e `app.community.types.*` (i18n — Task 1)
- Produces: `AppCommunityModalAuthorView({ authorName, authorAvatar?, onPresentationSelect?, onClose? })`

- [ ] **Step 1: Criar `src/components/app/app-community-modal-author-view.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppPresentationCard } from "@/components/app/app-presentation-card";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const AUTHOR_ITEMS = [
  {
    id: "a1",
    title: "CI/CD com GitHub Actions",
    type: PresentationType.multi,
    createdAtLabel: "há 3 dias",
  },
  {
    id: "a2",
    title: "Deploy com Docker e Kubernetes",
    type: PresentationType.single,
    createdAtLabel: "há 1 mês",
  },
  {
    id: "a3",
    title: "Git branching strategies",
    type: PresentationType.multi,
    createdAtLabel: "há 2 meses",
  },
];

interface AppCommunityModalAuthorViewProps {
  authorName: string;
  authorAvatar?: string;
  onPresentationSelect?: (presentationId: string) => void;
  onClose?: () => void;
  className?: string;
}

export function AppCommunityModalAuthorView({
  authorName,
  authorAvatar,
  onPresentationSelect,
  onClose,
  className,
}: AppCommunityModalAuthorViewProps) {
  const t = useTranslations("app.community.modal");
  const tTypes = useTranslations("app.community.types");

  return (
    <div className={cn("app-community-modal-author-view flex flex-col", className)}>
      <div className="app-community-modal-author-profile flex items-center gap-3 border-b p-4">
        <Avatar size="default">
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="app-community-modal-author-name text-sm font-semibold">
          {authorName}
        </span>
      </div>

      <div className="app-community-modal-author-presentations flex flex-col gap-3 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("author.presentations")}
        </span>
        <div className="app-community-modal-author-grid grid grid-cols-2 gap-2">
          {AUTHOR_ITEMS.map((item) => (
            <AppPresentationCard
              key={item.id}
              title={item.title}
              type={item.type}
              typeLabel={tTypes(TYPE_KEY[item.type])}
              createdAtLabel={item.createdAtLabel}
              createdBy={authorName}
              actions={[]}
              onSelect={() => onPresentationSelect?.(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="app-community-modal-author-footer border-t p-4">
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            className="app-community-modal-author-close"
            onClick={onClose}
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
```

---

### Task 11: AppCommunityModal — shell com navegação interna

**Files:**
- Create: `src/components/app/app-community-modal.tsx`

**Interfaces:**
- Consumes: `AppCommunityModalDuplicateView` (Task 9), `AppCommunityModalAuthorView` (Task 10), `app.community.modal.{back,duplicate,author.presentations}` (i18n — Task 1)
- Produces: `AppCommunityModal({ open, onOpenChange, title, typeLabel, createdAtLabel, createdBy, authorName?, authorAvatar? })` — mesma interface externa do `AppCommunityDuplicateModal` acrescida de `authorName?` e `authorAvatar?`

- [ ] **Step 1: Criar `src/components/app/app-community-modal.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AppCommunityModalDuplicateView } from "@/components/app/app-community-modal-duplicate-view";
import { AppCommunityModalAuthorView } from "@/components/app/app-community-modal-author-view";

type DuplicateViewData = {
  title: string;
  typeLabel: string;
  createdAtLabel: string;
  createdBy: string;
  authorName: string;
  authorAvatar?: string;
};

type ModalView =
  | ({ kind: "duplicate" } & DuplicateViewData)
  | { kind: "author"; authorName: string; authorAvatar?: string; previous: DuplicateViewData };

interface AppCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  typeLabel: string;
  createdAtLabel: string;
  createdBy: string;
  authorName?: string;
  authorAvatar?: string;
}

export function AppCommunityModal({
  open,
  onOpenChange,
  title,
  typeLabel,
  createdAtLabel,
  createdBy,
  authorName = createdBy,
  authorAvatar,
}: AppCommunityModalProps) {
  const t = useTranslations("app.community.modal");

  const initialDuplicate: DuplicateViewData = {
    title,
    typeLabel,
    createdAtLabel,
    createdBy,
    authorName,
    authorAvatar,
  };

  const [view, setView] = useState<ModalView>({ kind: "duplicate", ...initialDuplicate });

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) setView({ kind: "duplicate", ...initialDuplicate });
    onOpenChange(isOpen);
  }

  function handleAuthorClick() {
    if (view.kind !== "duplicate") return;
    setView({
      kind: "author",
      authorName: view.authorName,
      authorAvatar: view.authorAvatar,
      previous: view,
    });
  }

  function handleBack() {
    if (view.kind !== "author") return;
    setView({ kind: "duplicate", ...view.previous });
  }

  function handlePresentationSelect(presentationId: string) {
    if (view.kind !== "author") return;
    setView({
      kind: "duplicate",
      title: `Apresentação ${presentationId}`,
      typeLabel: view.previous.typeLabel,
      createdAtLabel: "há 3 dias",
      createdBy: view.authorName,
      authorName: view.authorName,
      authorAvatar: view.authorAvatar,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="app-community-modal gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {view.kind === "duplicate" ? view.title : view.authorName}
          </DialogTitle>
          <DialogDescription>
            {view.kind === "duplicate" ? t("duplicate") : t("author.presentations")}
          </DialogDescription>
        </DialogHeader>

        {view.kind === "author" && (
          <div className="app-community-modal-nav flex items-center gap-2 border-b px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="app-community-modal-back -ml-2 gap-1.5 text-xs"
              onClick={handleBack}
            >
              <ArrowLeft className="size-3.5" />
              {t("back")}
            </Button>
          </div>
        )}

        {view.kind === "duplicate" && (
          <AppCommunityModalDuplicateView
            title={view.title}
            typeLabel={view.typeLabel}
            createdAtLabel={view.createdAtLabel}
            createdBy={view.createdBy}
            onAuthorClick={handleAuthorClick}
          />
        )}

        {view.kind === "author" && (
          <AppCommunityModalAuthorView
            authorName={view.authorName}
            authorAvatar={view.authorAvatar}
            onPresentationSelect={handlePresentationSelect}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

### Task 12: Atualizar consumidores e remover modal antigo

**Files:**
- Modify: `src/components/app/community/app-community.tsx`
- Modify: `src/components/app/dashboard/community/app-dashboard-community.tsx`
- Delete: `src/components/app/app-community-duplicate-modal.tsx`

**Interfaces:**
- Consumes: `AppCommunityModal` (Task 11)

- [ ] **Step 1: Atualizar `src/components/app/community/app-community.tsx`**

Adicionar `authorId: string` e `authorName: string` ao mock `ITEMS` e atualizar o modal:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import { AppCommunityModal } from "@/components/app/app-community-modal";
import { AppCommunityHeader } from "@/components/app/community/app-community-header";
import { AppCommunityToolbar } from "@/components/app/community/app-community-toolbar";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  { id: "1", title: "CI/CD com GitHub Actions", createdBy: "Lucas M.", authorName: "Lucas M.", type: PresentationType.multi, createdAtLabel: "há 3 dias" },
  { id: "2", title: "Fluxo de onboarding", createdBy: "Ana P.", authorName: "Ana P.", type: PresentationType.single, createdAtLabel: "há 1 semana" },
  { id: "3", title: "Event sourcing com Kafka", createdBy: "Rafael S.", authorName: "Rafael S.", type: PresentationType.multi, createdAtLabel: "há 2 semanas" },
  { id: "4", title: "Design system com Figma", createdBy: "Carla T.", authorName: "Carla T.", type: PresentationType.multi, createdAtLabel: "há 3 semanas" },
  { id: "5", title: "Arquitetura hexagonal", createdBy: "Bruno F.", authorName: "Bruno F.", type: PresentationType.single, createdAtLabel: "há 1 mês" },
  { id: "6", title: "Estratégia de testes", createdBy: "Marta L.", authorName: "Marta L.", type: PresentationType.multi, createdAtLabel: "há 1 mês" },
];

type CommunityItem = (typeof ITEMS)[number];

export function AppCommunity({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.community");
  const [selected, setSelected] = useState<CommunityItem | null>(null);

  return (
    <>
      <LayoutSection className="md:pb-16">
        <LayoutContainer className="justify-center">
          <div
            className={cn(
              "app-community w-full max-w-4xl flex flex-col gap-4",
              className,
            )}
            {...props}
          >
            <AppCommunityHeader />
            <AppCommunityToolbar />

            {ITEMS.length === 0 ? (
              <div className="app-community-empty">
                <Muted className="text-sm">{t("empty.label")}</Muted>
              </div>
            ) : (
              <div className="app-community-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ITEMS.map((item) => (
                  <AppPresentationCard
                    key={item.id}
                    title={item.title}
                    type={item.type}
                    typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                    createdAtLabel={item.createdAtLabel}
                    createdBy={item.createdBy}
                    actions={["share", "copyLink"]}
                    onSelect={() => setSelected(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </LayoutContainer>
      </LayoutSection>

      {selected && (
        <AppCommunityModal
          key={selected.id}
          open
          onOpenChange={(open) => !open && setSelected(null)}
          title={selected.title}
          typeLabel={t(`types.${TYPE_KEY[selected.type]}`)}
          createdAtLabel={selected.createdAtLabel}
          createdBy={selected.createdBy}
          authorName={selected.authorName}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Atualizar `src/components/app/dashboard/community/app-dashboard-community.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { LayoutContainer } from "@/components/layouts/layout-container";
import { LayoutSection } from "@/components/layouts/layout-section";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";
import { cn } from "@/lib/utils";

import { AppPresentationCard } from "@/components/app/app-presentation-card";
import { AppCommunityModal } from "@/components/app/app-community-modal";
import { AppDashboardCommunityHeader } from "@/components/app/dashboard/community/app-dashboard-community-header";

const TYPE_KEY = Object.fromEntries(
  Object.entries(PresentationType).map(([k, v]) => [v, k]),
) as Record<number, keyof typeof PresentationType>;

const ITEMS = [
  { id: "1", title: "CI/CD com GitHub Actions", createdBy: "Lucas M.", authorName: "Lucas M.", type: PresentationType.multi, createdAtLabel: "há 3 dias" },
  { id: "2", title: "Fluxo de onboarding", createdBy: "Ana P.", authorName: "Ana P.", type: PresentationType.single, createdAtLabel: "há 1 semana" },
  { id: "3", title: "Event sourcing com Kafka", createdBy: "Rafael S.", authorName: "Rafael S.", type: PresentationType.multi, createdAtLabel: "há 2 semanas" },
];

type CommunityItem = (typeof ITEMS)[number];

export function AppDashboardCommunity({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations("app.dashboard.community");
  const [selected, setSelected] = useState<CommunityItem | null>(null);

  return (
    <>
      <LayoutSection className="first:pt-6 md:first:pt-8">
        <LayoutContainer className="justify-center">
          <div
            className={cn(
              "app-dashboard-community w-full max-w-4xl flex flex-col gap-4",
              className,
            )}
            {...props}
          >
            <AppDashboardCommunityHeader />

            {ITEMS.length === 0 ? (
              <div className="app-dashboard-community-empty">
                <Muted className="text-sm">{t("empty")}</Muted>
              </div>
            ) : (
              <div className="app-dashboard-community-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ITEMS.map((item) => (
                  <AppPresentationCard
                    key={item.id}
                    title={item.title}
                    type={item.type}
                    typeLabel={t(`types.${TYPE_KEY[item.type]}`)}
                    createdAtLabel={item.createdAtLabel}
                    createdBy={item.createdBy}
                    actions={["share", "copyLink"]}
                    onSelect={() => setSelected(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </LayoutContainer>
      </LayoutSection>

      {selected && (
        <AppCommunityModal
          key={selected.id}
          open
          onOpenChange={(open) => !open && setSelected(null)}
          title={selected.title}
          typeLabel={t(`types.${TYPE_KEY[selected.type]}`)}
          createdAtLabel={selected.createdAtLabel}
          createdBy={selected.createdBy}
          authorName={selected.authorName}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Deletar `src/components/app/app-community-duplicate-modal.tsx`**

```bash
rm src/components/app/app-community-duplicate-modal.tsx
```

- [ ] **Step 4: Commit final**

```bash
git add src/components/app/app-community-modal.tsx \
        src/components/app/app-community-modal-duplicate-view.tsx \
        src/components/app/app-community-modal-author-view.tsx \
        src/components/app/community/app-community.tsx \
        src/components/app/dashboard/community/app-dashboard-community.tsx
git rm src/components/app/app-community-duplicate-modal.tsx
git commit -m "feat: refactor AppCommunityDuplicateModal into AppCommunityModal with author profile navigation"
```

---

### Task 13: Atualizar pm.md

**Files:**
- Modify: `docs/sdd/1-product/pm.md`

- [ ] **Step 1: Marcar tarefas concluídas no pm.md**

No bloco `Active`, marcar como `[x]`:
- `[ ] P1` Auth module → `[x]`
- `[ ] P2` App module — criação manual (+) → `[x]`
- `[ ] P2` App module — presentations (list) → `[x]` (atualizar descrição para refletir trash + favorites)
- `[ ] P3` App module — app/templates → `[x]`
- `[ ] P3` App module — app/community → `[x]` (atualizar para incluir author profile modal)

- [ ] **Step 2: Commit**

```bash
git add docs/sdd/1-product/pm.md
git commit -m "chore: update pm.md — mark presentations, templates, community, auth and new modal as done"
```

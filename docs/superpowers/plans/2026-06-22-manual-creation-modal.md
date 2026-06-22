# Manual Presentation Creation Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mapear os componentes do `AppNewPresentationModal` e seus dois triggers (`AppNavRail` e `AppDashboardRecents` header), seguindo o padrão de mapeamento estrutural do projeto (fase 2a — sem lógica dinâmica).

**Architecture:** Modal Dialog (`@base-ui/react/dialog`) composto por sub-componentes semânticos em `components/app/new/`. O estado do Dialog fica no componente pai (trigger), passado via prop `open/onOpenChange`. Nesta fase de mapeamento os sub-componentes são skeletons estruturais — sem submissão de API.

**Tech Stack:** Next.js App Router, React, next-intl (server + client), shadcn/ui (`Dialog`, `Button`, `Input`, `Badge`, `Separator`), Lucide icons, Tailwind CSS, `@/lib/drizzle/schema/presentation` (enums).

## Global Constraints

- Todo elemento estrutural com propósito semântico recebe um `className` nomeado (padrão `app-new-presentation-modal-*`) — sem divs anônimas
- Todo texto visível passa por `next-intl` — sem strings hardcoded em componentes
- Primitivos shadcn/ui para toda estrutura visual — sem reinventar
- Enums de tipo importados de `@/lib/drizzle/schema/presentation` — nunca duplicar
- Componentes `"use client"` apenas quando necessário (interatividade/hooks)
- Sub-componentes de conteúdo podem ter estrutura interna — a restrição de divs anônimas se aplica a arquivos de assembly
- `Button` usa `render={<Component />} nativeButton={false}` para polimorfismo (sem `asChild`)

---

## Task 1: i18n — chaves `app.new.*`

**Files:**
- Modify: `src/i18n/dictionaries/pt-BR/app.json`
- Modify: `src/i18n/dictionaries/en-US/app.json`
- Modify: `src/i18n/dictionaries/es/app.json`

**Interfaces:**
- Produces: namespace `app.new` com chaves usadas em todas as tasks seguintes

- [ ] **Step 1: Adicionar chaves em `pt-BR/app.json`**

Adicionar dentro de `"app": { ... }`, após `"dashboard"`:

```json
"new": {
  "trigger": "Nova apresentação",
  "title": "Nova apresentação",
  "fields": {
    "title": {
      "label": "Título",
      "placeholder": "Sem título"
    }
  },
  "engine": {
    "label": "Engine",
    "name": "Excalidraw"
  },
  "type": {
    "label": "Tipo",
    "multi": "Apresentação",
    "single": "Diagrama"
  },
  "features": {
    "label": "Excalidraw",
    "items": [
      "An AI-powered all-in-one diagram platform",
      "A polished whiteboard tool with a clean, intuitive hand-drawn style",
      "Free-form drawing with shapes, arrows, text, and more"
    ]
  },
  "actions": {
    "cancel": "Cancelar",
    "create": "Criar"
  }
}
```

- [ ] **Step 2: Adicionar chaves em `en-US/app.json`**

```json
"new": {
  "trigger": "New presentation",
  "title": "New presentation",
  "fields": {
    "title": {
      "label": "Title",
      "placeholder": "Untitled"
    }
  },
  "engine": {
    "label": "Engine",
    "name": "Excalidraw"
  },
  "type": {
    "label": "Type",
    "multi": "Presentation",
    "single": "Diagram"
  },
  "features": {
    "label": "Excalidraw",
    "items": [
      "An AI-powered all-in-one diagram platform",
      "A polished whiteboard tool with a clean, intuitive hand-drawn style",
      "Free-form drawing with shapes, arrows, text, and more"
    ]
  },
  "actions": {
    "cancel": "Cancel",
    "create": "Create"
  }
}
```

- [ ] **Step 3: Adicionar chaves em `es/app.json`**

```json
"new": {
  "trigger": "Nueva presentación",
  "title": "Nueva presentación",
  "fields": {
    "title": {
      "label": "Título",
      "placeholder": "Sin título"
    }
  },
  "engine": {
    "label": "Motor",
    "name": "Excalidraw"
  },
  "type": {
    "label": "Tipo",
    "multi": "Presentación",
    "single": "Diagrama"
  },
  "features": {
    "label": "Excalidraw",
    "items": [
      "An AI-powered all-in-one diagram platform",
      "A polished whiteboard tool with a clean, intuitive hand-drawn style",
      "Free-form drawing with shapes, arrows, text, and more"
    ]
  },
  "actions": {
    "cancel": "Cancelar",
    "create": "Crear"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/dictionaries/
git commit -m "feat: add app.new i18n keys for manual creation modal"
```

---

## Task 2: Sub-componentes do modal

**Files:**
- Create: `src/components/app/new/app-new-presentation-modal-engine.tsx`
- Create: `src/components/app/new/app-new-presentation-modal-type.tsx`
- Create: `src/components/app/new/app-new-presentation-modal-features.tsx`
- Create: `src/components/app/new/app-new-presentation-modal-actions.tsx`

**Interfaces:**
- Consumes: `app.new.*` i18n keys (Task 1)
- Consumes: `PresentationType` de `@/lib/drizzle/schema/presentation`
- Produces:
  - `AppNewPresentationModalEngine` — sem props
  - `AppNewPresentationModalType({ value, onChange })` — `value: 0|1`, `onChange: (v: 0|1) => void`
  - `AppNewPresentationModalFeatures` — sem props
  - `AppNewPresentationModalActions({ onCancel })` — `onCancel: () => void`

- [ ] **Step 1: Criar `app-new-presentation-modal-engine.tsx`**

```tsx
import { Lock, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Muted } from "@/components/ui/typography";

export function AppNewPresentationModalEngine() {
  const t = useTranslations("app.new.engine");

  return (
    <div className="app-new-presentation-modal-engine flex items-center gap-2">
      <Muted className="text-xs">{t("label")}</Muted>
      <Badge variant="secondary" className="app-new-presentation-modal-engine-badge gap-1.5 rounded-full">
        <PenLine className="size-3" />
        {t("name")}
        <Lock className="size-2.5 opacity-50" />
      </Badge>
    </div>
  );
}
```

- [ ] **Step 2: Criar `app-new-presentation-modal-type.tsx`**

```tsx
"use client";

import { GalleryVerticalEnd, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import { PresentationType } from "@/lib/drizzle/schema/presentation";

interface AppNewPresentationModalTypeProps {
  value: (typeof PresentationType)[keyof typeof PresentationType];
  onChange: (value: (typeof PresentationType)[keyof typeof PresentationType]) => void;
}

export function AppNewPresentationModalType({
  value,
  onChange,
}: AppNewPresentationModalTypeProps) {
  const t = useTranslations("app.new.type");

  return (
    <div className="app-new-presentation-modal-type flex items-center gap-2">
      <Muted className="text-xs">{t("label")}</Muted>
      <div className="app-new-presentation-modal-type-options flex items-center gap-1.5">
        <Button
          variant={value === PresentationType.multi ? "outline" : "ghost"}
          size="sm"
          className="gap-1.5"
          onClick={() => onChange(PresentationType.multi)}
        >
          <GalleryVerticalEnd className="size-3.5" />
          {t("multi")}
        </Button>
        <Button
          variant={value === PresentationType.single ? "outline" : "ghost"}
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => onChange(PresentationType.single)}
        >
          <PenLine className="size-3.5" />
          {t("single")}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Criar `app-new-presentation-modal-features.tsx`**

```tsx
import { useTranslations } from "next-intl";

import { Muted } from "@/components/ui/typography";

export function AppNewPresentationModalFeatures() {
  const t = useTranslations("app.new.features");
  const items = t.raw("items") as string[];

  return (
    <div className="app-new-presentation-modal-features flex flex-col gap-2">
      <span className="app-new-presentation-modal-features-label text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("label")}
      </span>
      <ul className="app-new-presentation-modal-features-list flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="app-new-presentation-modal-features-item flex items-start gap-2">
            <span className="app-new-presentation-modal-features-bullet mt-0.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
            <Muted className="text-xs leading-relaxed">{item}</Muted>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Criar `app-new-presentation-modal-actions.tsx`**

```tsx
"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

interface AppNewPresentationModalActionsProps {
  onCancel: () => void;
}

export function AppNewPresentationModalActions({
  onCancel,
}: AppNewPresentationModalActionsProps) {
  const t = useTranslations("app.new.actions");

  return (
    <div className="app-new-presentation-modal-actions flex items-center justify-end gap-2">
      <DialogClose
        render={
          <Button variant="ghost" size="sm" onClick={onCancel} />
        }
      >
        {t("cancel")}
      </DialogClose>
      <Button size="sm" className="gap-1.5">
        <ArrowRight className="size-3.5" />
        {t("create")}
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/app/new/
git commit -m "feat: add AppNewPresentationModal sub-components (engine, type, features, actions)"
```

---

## Task 3: Modal organism — AppNewPresentationModal

**Files:**
- Create: `src/components/app/new/app-new-presentation-modal.tsx`

**Interfaces:**
- Consumes: todos os sub-componentes de Task 2
- Consumes: `app.new.*` i18n keys (Task 1)
- Produces: `AppNewPresentationModal({ open, onOpenChange })` — `open: boolean`, `onOpenChange: (open: boolean) => void`

- [ ] **Step 1: Criar `app-new-presentation-modal.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PresentationType } from "@/lib/drizzle/schema/presentation";

import { AppNewPresentationModalActions } from "@/components/app/new/app-new-presentation-modal-actions";
import { AppNewPresentationModalEngine } from "@/components/app/new/app-new-presentation-modal-engine";
import { AppNewPresentationModalFeatures } from "@/components/app/new/app-new-presentation-modal-features";
import { AppNewPresentationModalType } from "@/components/app/new/app-new-presentation-modal-type";

interface AppNewPresentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppNewPresentationModal({
  open,
  onOpenChange,
}: AppNewPresentationModalProps) {
  const t = useTranslations("app.new");
  const [type, setType] = useState<
    (typeof PresentationType)[keyof typeof PresentationType]
  >(PresentationType.multi);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="app-new-presentation-modal gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="app-new-presentation-modal-heading">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="app-new-presentation-modal-body flex flex-col gap-4">
          <div className="app-new-presentation-modal-field-title flex flex-col gap-1.5">
            <Input
              placeholder={t("fields.title.placeholder")}
              className="app-new-presentation-modal-title-input"
            />
          </div>

          <AppNewPresentationModalEngine />
          <AppNewPresentationModalType value={type} onChange={setType} />

          <Separator />

          <AppNewPresentationModalFeatures />
        </div>

        <AppNewPresentationModalActions onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/app/new/app-new-presentation-modal.tsx
git commit -m "feat: add AppNewPresentationModal organism"
```

---

## Task 4: Trigger — AppNavRail

**Files:**
- Modify: `src/components/app/app-nav-rail.tsx`

**Interfaces:**
- Consumes: `AppNewPresentationModal` (Task 3)
- Consumes: `app.new.trigger` i18n key (Task 1)

- [ ] **Step 1: Atualizar `app-nav-rail.tsx`**

```tsx
"use client";

import { useState } from "react";
import { GalleryVerticalEnd, Home, Plus, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { AppNewPresentationModal } from "@/components/app/new/app-new-presentation-modal";

const NAV_ITEMS = [
  { key: "home", icon: Home, href: "/app/dashboard" },
  { key: "presentations", icon: GalleryVerticalEnd, href: "/app/presentations" },
  { key: "settings", icon: Settings, href: "/app/settings" },
] as const;

export function AppNavRail() {
  const pathname = usePathname();
  const t = useTranslations("app.nav");
  const tNew = useTranslations("app.new");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <TooltipProvider delay={300}>
        <nav className="app-nav-rail flex flex-row gap-1 rounded-2xl border bg-card p-1.5 shadow-sm md:flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Tooltip key={item.key}>
                <TooltipTrigger render={
                  <Link
                    href={item.href}
                    aria-label={t(item.key)}
                    className={cn(
                      "flex items-center justify-center rounded-xl p-2.5 h-10 w-10 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  />
                }>
                  <item.icon className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="right" className="hidden md:flex">{t(item.key)}</TooltipContent>
              </Tooltip>
            );
          })}

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  aria-label={tNew("trigger")}
                  onClick={() => setModalOpen(true)}
                  className="app-nav-rail-new flex items-center justify-center rounded-xl p-2.5 h-10 w-10 transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                />
              }
            >
              <Plus className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden md:flex">
              {tNew("trigger")}
            </TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>

      <AppNewPresentationModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/app/app-nav-rail.tsx
git commit -m "feat: add new presentation trigger (+) to AppNavRail"
```

---

## Task 5: Trigger — AppDashboardRecents header

**Files:**
- Modify: `src/components/app/dashboard/recents/app-dashboard-recents.tsx`

**Interfaces:**
- Consumes: `AppNewPresentationModal` (Task 3)
- Consumes: `app.new.trigger` i18n key (Task 1)

- [ ] **Step 1: Atualizar `app-dashboard-recents.tsx`**

O componente é server component — o modal é client. Extrair o header com os botões para um client component separado `app-dashboard-recents-header.tsx`:

**Criar `src/components/app/dashboard/recents/app-dashboard-recents-header.tsx`:**

```tsx
"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AppNewPresentationModal } from "@/components/app/new/app-new-presentation-modal";

export function AppDashboardRecentsHeader() {
  const t = useTranslations("app.dashboard.recents");
  const tNew = useTranslations("app.new");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="app-dashboard-recents-header flex items-start justify-between gap-4">
        <div className="app-dashboard-recents-header-text flex flex-col gap-1">
          <span className="app-dashboard-recents-title text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("title")}
          </span>
        </div>
        <div className="app-dashboard-recents-header-actions flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-3.5" />
            {tNew("trigger")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
            render={<Link href="/app/presentations" />}
            nativeButton={false}
          >
            <ArrowRight className="size-3.5" />
            {t("viewAll")}
          </Button>
        </div>
      </div>

      <AppNewPresentationModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
```

- [ ] **Step 2: Atualizar `app-dashboard-recents.tsx` para usar o novo header**

Substituir o bloco `app-dashboard-recents-header` + botão view-all por `AppDashboardRecentsHeader`:

```tsx
// Remover imports de Button, Link, ArrowRight
// Adicionar:
import { AppDashboardRecentsHeader } from "@/components/app/dashboard/recents/app-dashboard-recents-header";

// Substituir no JSX:
// <div className="app-dashboard-recents-header ..."> ... </div>
// Por:
<AppDashboardRecentsHeader />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/app/dashboard/recents/
git commit -m "feat: add new presentation trigger (+) to AppDashboardRecents header"
```

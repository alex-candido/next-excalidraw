# Próximos Passos — lib/excalidraw

## Estado atual

- [x] Generators — `rectangle`, `ellipse`, `diamond`, `arrow`, `line`, `text`, `frame`
- [x] Schema — `SlideComposition` (union discriminada, 7 kinds)
- [x] Compose — `composeLayout` (todos os kinds implementados)
- [x] Normalize — `normalizeArrows`
- [x] Serialize — `serializeSkeleton`
- [x] DB — `outline.layout: text`, `slide.composition: jsonb`

---

## Passo 1 — Sandbox: testar o pipeline completo visualmente

**Arquivos:** `src/app/dev/sandbox/sandbox-content.tsx`

Adicionar uma aba "composition" no sandbox que exercita o pipeline completo:

```ts
SlideComposition → composeLayout → normalizeArrows → serializeSkeleton → ExcalidrawEditor
```

Testar cada `kind` com dados mockados para validar que os algoritmos de layout produzem o visual esperado antes de integrar com a IA.

---

## Passo 2 — Atualizar o slide-workflow para gerar SlideComposition

**Arquivos:**
- `src/lib/mastra/tools/slide-structure-tool.ts`
- `src/lib/mastra/prompts/slide-creator-prompt.ts`
- `src/lib/mastra/agents/slide-creator-agent.ts`
- `src/lib/mastra/workflows/slide-workflow.ts`

O workflow atual retorna `{ title, body, bullets }`. Precisa retornar `SlideComposition`.

A IA recebe o outline completo (`type`, `title`, `description`, `concepts`, `representation`, `layout`) e decide:
- qual `kind` usar
- como popular os campos do kind escolhido

O `slide-structure-tool` passa a usar `slideCompositionSchema` como `outputSchema`.

---

## Passo 3 — Atualizar o outline-workflow para gerar layout como texto livre

**Arquivos:**
- `src/lib/mastra/tools/outline-structure-tool.ts`
- `src/lib/mastra/prompts/outline-creator-prompt.ts`
- `src/lib/mastra/workflows/outline-workflow.ts`

O workflow de outline precisa gerar o campo `layout` como descrição de intenção visual:

```
"mapa mental com conceito central e 6 ramificações temáticas"
"dois painéis comparando abordagens com métricas lado a lado"
"slide de capa com título impactante e subtítulo descritivo"
```

---

## Passo 4 — Conectar o pipeline na API

**Arquivo:** `src/app/api/v1/app/presentations/generate/route.ts`

Orquestrar o fluxo completo:

```
outline-workflow → outlines salvos no DB
    ↓
slide-workflow → SlideComposition
    ↓
composeLayout → normalizeArrows → serializeSkeleton
    ↓
SLIDE.composition = SlideComposition (jsonb)
SLIDE.elements    = ExcalidrawFile.elements (jsonb)
```

---

## Passo 5 — Migration do banco

Gerar e aplicar a migration Drizzle para as alterações de schema:

- `outline.layout`: `smallint NOT NULL DEFAULT 0` → `text NULL`
- `slide.composition`: nova coluna `jsonb NULL`

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

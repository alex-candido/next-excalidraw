# Feature: Themes

Sistema de temas e personalização visual de apresentações.

> Implementação: Ciclo 4. Referência: `temp/presentation-ai/src/lib/presentation/themes.ts`.

## Visão geral

Um tema define a paleta de cores semântica, a tipografia e o background de uma apresentação. Aplicado globalmente, o tema se traduz em `strokeColor`, `backgroundColor` e `appState` dos elementos Excalidraw.

---

## Estrutura do tema

```ts
type PresentationTheme = {
  name:        string
  description: string
  mode:        "light" | "dark"
  colors: {
    primary:        string   // cor principal — shapes, destaques
    accent:         string   // cor secundária
    background:     string   // fundo do slide (appState.viewBackgroundColor)
    text:           string   // strokeColor padrão de elementos text
    heading:        string   // strokeColor de títulos
    cardBackground: string   // backgroundColor de shapes/containers
  }
  typography: {
    heading: { family: string; weight: string }
    body:    { family: string; weight: string }
  }
  background?: {
    type:  "solid" | "gradient" | "image"
    value: string   // cor hex, CSS gradient ou URL
  }
}
```

---

## Aplicação do tema no Excalidraw

Ao aplicar um tema, os elementos são atualizados:

```
theme.colors.text         → strokeColor de todos os elementos text
theme.colors.primary      → strokeColor de shapes primários
theme.colors.cardBackground → backgroundColor de shapes/containers
theme.colors.background   → appState.viewBackgroundColor
```

> Aplicação é feita via `excalidrawAPI.updateScene()` no cliente — não requer nova geração AI.

---

## Fluxo de seleção de tema

```
Toolbar do editor → "Temas"
  └─ galeria de temas pré-definidos (grid com preview)
        └─ usuário seleciona tema
              └─ preview ao vivo no canvas (sem salvar)
                    └─ confirma → PATCH /api/v1/app/presentations/[id] { theme }
                          └─ canvas atualizado, tema salvo
```

---

## Temas pré-definidos

10 temas implementados no Ciclo 4 MVP. Índices definidos em `src/lib/drizzle/schema/presentation.ts` (`PresentationTheme`):

| Índice | Nome | Categoria |
|--------|------|-----------|
| 0 | daktilo | Claro neutro |
| 1 | noir | Escuro |
| 2 | cornflower | Claro vibrante |
| 3 | indigo | Escuro vibrante |
| 4 | orbit | Escuro elegante |
| 5 | cosmos | Escuro elegante |
| 6 | sunset | Vibrante |
| 7 | forest | Natural |
| 8 | piano | Escuro minimalista |
| 9 | ebony | Escuro minimalista |

> Referência: `presentation-ai` usa 41 temas — expansão planejada como melhoria pós-Ciclo 4.

---

## Persistência

```
Presentation.theme: smallint   // índice do tema ativo (PresentationTheme enum)
```

> Campo `theme: smallint` já existe no schema (`src/lib/drizzle/schema/presentation.ts`). Default: `0` (daktilo).

---

## Pontos de atenção

- Aplicação de tema não regenera elementos — é 100% client-side via `updateScene`
- Tema padrão: "default" (preto sobre branco — estilo Excalidraw nativo)
- Customização avançada (criar tema personalizado) — fora do escopo do Ciclo 4 MVP
- Background com imagem requer storage externo (S3/R2) — disponível a partir do Ciclo 4

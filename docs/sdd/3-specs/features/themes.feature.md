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

Categorias inspiradas no `presentation-ai` (41 temas) — adaptar para paletas que funcionem bem com o estilo handdrawn do Excalidraw:

| Categoria | Exemplos |
|-----------|---------|
| Claro neutro | default, sand, glacier |
| Escuro | dark, obsidian, midnight, noir |
| Vibrante | crimson, sunset, coral, amber |
| Natural | forest, ocean, jade, mint |
| Elegante | cosmos, piano, lavender, rose |

---

## Persistência

```
Presentation.theme: string   // nome do tema ativo
```

> Schema já tem campo `usage: jsonb` — o tema pode ser adicionado como campo dedicado `theme: text` em uma migration.

---

## Pontos de atenção

- Aplicação de tema não regenera elementos — é 100% client-side via `updateScene`
- Tema padrão: "default" (preto sobre branco — estilo Excalidraw nativo)
- Customização avançada (criar tema personalizado) — fora do escopo do Ciclo 4 MVP
- Background com imagem requer storage externo (S3/R2) — disponível a partir do Ciclo 4

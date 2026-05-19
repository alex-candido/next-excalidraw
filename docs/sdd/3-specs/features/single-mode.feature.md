# Feature: Single Mode

Modalidade de criação de um diagrama único sem outline. Três subtipos distintos por tipo de input.

> Implementação: Ciclo 5. Este documento é o blueprint de design — não há código ainda.

## Visão geral

```
/single/new (form)
  └─ subtipo: prompt | imagem-referência | foto-anotações
        │
        ▼
  singleWorkflow.start()
        │
        ▼
  /single/[id]/editor    → canvas Excalidraw com o diagrama gerado
        │
        ▼
  /single/[id]/present   → visualização fullscreen (opcional)
```

---

## Subtipo 1 — Prompt → Diagrama

### Entrada

```ts
{
  userPrompt:      string     // descrição do diagrama desejado
  representation:  number     // tipo de representação (flowchart, mindmap, architecture, etc.)
  language:        number     // idioma dos textos no diagrama
  aspectRatio:     number     // proporção do canvas
}
```

> `representation` é escolhida pelo usuário no form — diferente do Multi onde o AI escolhe.

### Fluxo

```
1. Cria Single { type: "prompt", status: draft }
2. singleWorkflow.start({ userPrompt, representation, language, aspectRatio })
   └─ slideWorkflow reutilizado com type="content" e representation=escolhido
3. Persiste elements no banco
4. Redirect → /single/[id]/editor
```

---

## Subtipo 2 — Imagem como Referência → Excalidraw

Usuário faz upload de uma imagem (foto, screenshot, diagram PNG) e o modelo gera uma representação Excalidraw baseada no conteúdo visual.

### Entrada

```ts
{
  imageUrl:        string     // URL da imagem após upload
  userPrompt:      string     // instrução adicional (opcional — ex: "simplify" ou "add labels")
  representation:  number     // tipo de representação desejado
  language:        number
  aspectRatio:     number
}
```

### Fluxo

```
1. Upload da imagem → storage (S3/R2)
2. Cria Single { type: "image-reference", status: draft }
3. singleVisionWorkflow.start({ imageUrl, userPrompt, representation, language, aspectRatio })
   └─ vision step: model recebe imagem + instrução → gera ExcalidrawElementSkeleton[]
4. Persiste elements no banco
5. Redirect → /single/[id]/editor
```

---

## Subtipo 3 — Foto com Anotações → Digitalização

Usuário fotografa um quadro branco, esboço em papel ou qualquer diagrama desenhado à mão. O modelo lê as anotações e gera uma ilustração Excalidraw fiel.

### Entrada

```ts
{
  imageUrl:    string     // foto do quadro branco / esboço
  language:    number     // idioma das anotações na imagem
  aspectRatio: number
}
```

> Sem `representation` — o modelo infere o tipo a partir do conteúdo da imagem.

### Fluxo

```
1. Upload da foto → storage (S3/R2)
2. Cria Single { type: "whiteboard-scan", status: draft }
3. whiteboardDigitizeWorkflow.start({ imageUrl, language, aspectRatio })
   └─ vision step: model lê imagem → identifica elementos → gera ExcalidrawElementSkeleton[]
        └─ intenção: preservar estrutura e anotações, não interpretar — ser fiel ao original
4. Persiste elements no banco
5. Redirect → /single/[id]/editor
```

---

## Visualização versátil

O Single terá modos de visualização além do editor padrão:

| Modo | Rota | Descrição |
|------|------|-----------|
| Editor | `/single/[id]/editor` | Canvas Excalidraw editável |
| Fullscreen | `/single/[id]/present` | Visualização sem toolbar |
| Embed | `/single/[id]/embed` | iframe exportável para documentos e posts |

---

## Decisões abertas

- **Workflow separado ou step condicional** — `singleWorkflow` dedicado ou reutilizar `slideWorkflow` com parâmetros (ver `docs/adr.md`)
- **Storage de imagens** — S3/R2 para upload (Ciclo 4); avaliar UploadThing como na referência `presentation-ai`
- **Vision model** — Gemini já suporta vision; verificar se o step de vision pode ser integrado ao Mastra

## Pontos de atenção

- Subtipo 3 (digitalização) deve ser fiel ao original — sem "melhorar" ou "interpretar" a imagem
- Upload de imagem requer storage externo — não disponível no Ciclo 2/3
- `aspectRatio` nos subtipos 2 e 3 pode ser inferido das dimensões da imagem enviada
- Embed mode requer apresentações públicas (`visibility: public`) — Ciclo 4

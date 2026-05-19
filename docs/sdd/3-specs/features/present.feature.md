# Feature: Present Mode

Página `/presentations/[id]/present` — apresentação fullscreen dos slides.

## Entrada

- `presentationId` via path param
- Slides com `elements` já persistidos (mesmo conjunto do editor)

## Estado da página

```
loading       → convertendo slides para imagens
ready         → apresentação ativa, navegação disponível
```

## Comportamento

```
1. Carrega todos os slides da presentation
2. Converte elements → imagens via exportToImageUrls()
   (client-side only, usa ExcalidrawImperativeAPI)
3. Exibe fullscreen: <img src={urls[currentIndex]} />
4. Navegação entre slides
5. ESC → sai do modo apresentação → volta para /editor
```

> Abordagem por imagens garante performance máxima — sem re-render do canvas durante apresentação.
> Referência: `inscribed/PresentationMode.tsx` (ver `docs/reports/references-analysis.md`).

## Layout

```
┌──────────────────────────────────────────────────┐
│                                                  │
│         slide atual como <img> fullscreen        │
│                                                  │
│  ◀ (área esquerda, clique = voltar)              │
│                           ▶ (área direita = avançar) │
│                                                  │
│  indicador: 3 / 9 (número do slide)              │
└──────────────────────────────────────────────────┘
```

## Navegação

| Interação | Ação |
|-----------|------|
| `→` / clique direito | próximo slide |
| `←` / clique esquerdo | slide anterior |
| `ESC` | fechar, voltar ao editor |
| Swipe left | próximo slide (touch) |
| Swipe right | slide anterior (touch) |

## Pontos de atenção

- `exportToImageUrls` é client-side only e requer que o canvas já esteja carregado
- O canvas pode ser inicializado em background (oculto) apenas para exportar as imagens
- Não há edição no modo apresentação — qualquer mudança requer voltar ao editor
- `aspectRatio` da Presentation define as proporções da imagem exportada

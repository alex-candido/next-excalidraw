import { hasEnoughSignal, splitSentences, tokenize } from "./tokenize"

// TextRank (Mihalcea & Tarau, 2004) — ideia aproveitada do `node-summarizer`
// (achado ao pesquisar libs prontas, mas ele depende de `natural`, que quebra
// no nosso ambiente — ver lib/utils/text/index.ts). Reimplementado do zero, sem
// dependência: cada frase é um nó de um
// grafo, o peso da aresta é o quão parecidas duas frases são (palavras em
// comum), e a pontuação final vem de um algoritmo iterativo tipo PageRank —
// frase pontua alto se é parecida com várias outras frases importantes, não só
// por repetir palavra comum. Na prática, cobre mais partes do documento inteiro
// que o resumo por frequência (que tende a focar no sub-tópico mais denso).
function similarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0
  const setB = new Set(tokensB)
  const common = tokensA.filter((w) => setB.has(w)).length
  const normalization = Math.log(tokensA.length + 1) + Math.log(tokensB.length + 1)
  return normalization === 0 ? 0 : common / normalization
}

export function textRankSummarizer() {
  function summarize(
    text: string,
    numSentences: number,
    options?: { damping?: number; iterations?: number },
  ): string {
    const sentences = splitSentences(text)
    if (sentences.length <= numSentences) return text

    const sentenceTokens = sentences.map(tokenize)
    if (!hasEnoughSignal(sentenceTokens)) {
      return sentences.slice(0, numSentences).join(" ")
    }

    const n = sentences.length
    const sim: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) sim[i][j] = similarity(sentenceTokens[i], sentenceTokens[j])
      }
    }
    const outSum = sim.map((row) => row.reduce((a, b) => a + b, 0))

    const damping = options?.damping ?? 0.85
    const iterations = options?.iterations ?? 30

    let scores = new Array(n).fill(1)
    for (let iter = 0; iter < iterations; iter++) {
      const next = new Array(n).fill(1 - damping)
      for (let i = 0; i < n; i++) {
        let sum = 0
        for (let j = 0; j < n; j++) {
          if (j === i || sim[j][i] === 0 || outSum[j] === 0) continue
          sum += (sim[j][i] / outSum[j]) * scores[j]
        }
        next[i] += damping * sum
      }
      scores = next
    }

    return sentences
      .map((sentence, index) => ({ sentence, index, score: scores[index] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => a.index - b.index)
      .map((s) => s.sentence)
      .join(" ")
  }

  return { summarize }
}

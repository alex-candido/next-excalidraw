import { hasEnoughSignal, splitSentences, tokenize } from "./tokenize"

// Resumo extrativo por frequência de palavra. Sem lista de stopword por
// idioma — usa frequência de documento (palavra presente em >40% das frases
// é conectivo comum, independente do idioma) em vez de dicionário fixo.
// Tende a concentrar em um sub-tópico só (o mais denso do texto) — ver
// text-rank-summarizer.ts pra cobertura mais ampla do documento inteiro.
export function frequencySummarizer() {
  function summarize(text: string, numSentences: number): string {
    const sentences = splitSentences(text)
    if (sentences.length <= numSentences) return text

    const sentenceTokens = sentences.map(tokenize)
    if (!hasEnoughSignal(sentenceTokens)) {
      return sentences.slice(0, numSentences).join(" ")
    }

    const docFreq = new Map<string, number>()
    for (const tokens of sentenceTokens) {
      for (const word of new Set(tokens)) {
        if (word.length > 2) docFreq.set(word, (docFreq.get(word) ?? 0) + 1)
      }
    }

    const stopThreshold = sentences.length * 0.4

    const termFreq = new Map<string, number>()
    for (const tokens of sentenceTokens) {
      for (const word of tokens) {
        if (word.length <= 2 || (docFreq.get(word) ?? 0) > stopThreshold) continue
        termFreq.set(word, (termFreq.get(word) ?? 0) + 1)
      }
    }

    const scored = sentences.map((sentence, index) => {
      const tokens = sentenceTokens[index].filter(
        (w) => w.length > 2 && (docFreq.get(w) ?? 0) <= stopThreshold,
      )
      const score = tokens.reduce((sum, w) => sum + (termFreq.get(w) ?? 0), 0) / Math.max(tokens.length, 1)
      return { sentence, index, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => a.index - b.index)
      .map((s) => s.sentence)
      .join(" ")
  }

  return { summarize }
}

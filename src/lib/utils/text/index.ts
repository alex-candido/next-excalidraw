// Resumo extrativo de texto, sem dependência (utilitário genérico, reaproveitável
// em qualquer parte do projeto que precise reduzir texto — não é específico de
// attachments, que é o único consumidor por ora).
//
// Testadas 2 libs prontas isoladamente antes de escrever isso: `fast-ai-text-
// summary` (2025, ativa) e `node-summarizer` (2019) — ambas quebram no nosso
// ambiente porque dependem de `natural`, que carrega binding nativo abandonado/
// incompatível (LAPACK ausente / `webworker-threads` sem binário / `node:v8`
// não implementado no Bun via mongoose). TextRank foi a ideia aproveitada do
// `node-summarizer` (a outra técnica que ele oferece, além de frequência);
// reimplementada do zero, sem a dependência.
import { frequencySummarizer } from "./frequency-summarizer"
import { textRankSummarizer } from "./text-rank-summarizer"

export function textUtils() {
  // TextRank como padrão — cobre mais partes do documento inteiro que o de
  // frequência (que tende a focar só no sub-tópico mais denso), o que serve
  // melhor pra dar contexto amplo à IA sobre o que um anexo contém.
  function summarize(text: string, numSentences: number): string {
    return textRankSummarizer().summarize(text, numSentences)
  }

  function summarizeByFrequency(text: string, numSentences: number): string {
    return frequencySummarizer().summarize(text, numSentences)
  }

  function summarizeByTextRank(
    text: string,
    numSentences: number,
    options?: { damping?: number; iterations?: number },
  ): string {
    return textRankSummarizer().summarize(text, numSentences, options)
  }

  return { summarize, summarizeByFrequency, summarizeByTextRank }
}

// gist: resumo extrativo de texto, sem dependência — módulo separado de
// attachments/ porque a funcionalidade em si (resumir texto) não tem nada a
// ver com anexo, pode ser reaproveitada em qualquer lugar do projeto que
// precise disso.
//
// Testadas 2 libs prontas isoladamente antes de escrever isso: `fast-ai-text-
// summary` (2025, ativa) e `node-summarizer` (2019) — ambas quebram no nosso
// ambiente porque dependem de `natural`, que carrega binding nativo abandonado/
// incompatível (LAPACK ausente / `webworker-threads` sem binário / `node:v8`
// não implementado no Bun via mongoose). TextRank foi a ideia aproveitada do
// `node-summarizer` (a outra técnica que ele oferece, além de frequência);
// reimplementada do zero, sem a dependência.
export { frequencySummarizer } from "./frequency-summarizer"
export { textRankSummarizer } from "./text-rank-summarizer"

import { textRankSummarizer } from "./text-rank-summarizer"

// TextRank como padrão — cobre mais partes do documento inteiro que o de
// frequência (que tende a focar só no sub-tópico mais denso), o que serve
// melhor pra dar contexto amplo à IA sobre o que um anexo contém.
export function summarizeText(text: string, numSentences: number): string {
  return textRankSummarizer().summarize(text, numSentences)
}

// Compartilhado entre as duas técnicas de resumo (frequência e TextRank) —
// separação de frase e palavra não muda entre elas, só o jeito de pontuar.

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    // CJK (。！？) não usa maiúscula nem espaço depois do ponto — separa direto.
    // Latino (.!?) exige maiúscula/fim de string depois, senão "Dr." ou "3.14"
    // viram quebra de frase errada.
    .split(/(?<=[。！？])|(?<=[.!?])\s+(?=[A-ZÀ-Ú]|$)/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function tokenize(sentence: string): string[] {
  return (
    sentence
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // remove diacrítico só pra contagem — funciona pra qualquer idioma latino
      .match(/[a-z0-9]+/g) ?? []
  )
}

// Sinal insuficiente pra pontuar por frequência/similaridade (ex: texto
// majoritariamente em CJK, sem token latino) — nesse caso as duas técnicas
// caem no mesmo fallback: devolver as primeiras N frases, na ordem.
export function hasEnoughSignal(sentenceTokens: string[][]): boolean {
  const totalTokens = sentenceTokens.reduce((sum, t) => sum + t.length, 0)
  return totalTokens / Math.max(sentenceTokens.length, 1) >= 2
}

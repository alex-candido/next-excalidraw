interface ScrollToElementOptions {
  // Offset fixo em px — ex: altura de um header sticky, que não escala com
  // a tela e precisa ser descontado pra não cobrir o alvo.
  offsetPx?: number
  // Respiro adicional como fração da altura da viewport (0.1 = 10%) — em vez
  // de um px fixo, escala com o tamanho da tela.
  gapRatio?: number
}

export function scrollToElement(id: string, options: ScrollToElementOptions = {}) {
  const { offsetPx = 0, gapRatio = 0 } = options
  const target = document.getElementById(id)
  if (!target) return false

  const gap = window.innerHeight * gapRatio
  const top = target.getBoundingClientRect().top + window.scrollY - offsetPx - gap
  window.scrollTo({ top, behavior: "smooth" })
  return true
}

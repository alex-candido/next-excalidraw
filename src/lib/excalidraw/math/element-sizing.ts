const WIDE_LANGUAGES = new Set(["pt", "ptBR", "es", "fr", "de", "it"])

export function elementSizing() {
  function calcTextWidth(text: string, language = "en"): number {
    const longestLine = text.split("\n").reduce((max, line) => Math.max(max, line.length), 0)
    const base = Math.max(longestLine * 8, 80)
    return WIDE_LANGUAGES.has(language) ? Math.round(base * 1.15) : base
  }

  function calcContainerHeight(lines: number, fontSize: number, padding = 20): number {
    return Math.round(lines * (fontSize * 1.5) + padding * 2)
  }

  function snapToGrid(value: number, gridSize = 20): number {
    return Math.round(value / gridSize) * gridSize
  }

  return { calcTextWidth, calcContainerHeight, snapToGrid }
}

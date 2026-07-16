import type { DbClient } from "@/lib/drizzle"
import { presentationEntryRepository } from "@/server/repositories/app/presentation-entry-repository"
import { PresentationEntryKind } from "@/lib/drizzle/schema/presentation-entry"
import type { PresentationEntrySuggestion, PresentationEntrySuggestionList } from "@/schemas/app/presentation-entry-schema"

interface PresentationEntryRow {
  id: string
  type: number
  language: number
  icon: string | null
  title: string | null
  description: string | null
  prompt: string
  aspectRatio: number
  slideCount: number
  amount: number
  audience: number
  scenario: number
  theme: number
  keywords: string[] | null
}

function toSuggestionResult(row: PresentationEntryRow): PresentationEntrySuggestion {
  return {
    id:          row.id,
    type:        row.type,
    language:    row.language,
    icon:        row.icon,
    title:       row.title,
    description: row.description,
    prompt:      row.prompt,
    aspectRatio: row.aspectRatio,
    slideCount:  row.slideCount,
    amount:      row.amount,
    audience:    row.audience,
    scenario:    row.scenario,
    theme:       row.theme,
    keywords:    row.keywords,
  }
}

export function presentationEntryService() {
  async function listSuggestions(input: PresentationEntrySuggestionList) {
    const rows = await presentationEntryRepository().findRandomSuggestions(input)
    return rows.map(toSuggestionResult)
  }

  // Chamado por presentationService().create() SEMPRE (não é best-effort/log
  // secundário) — presentation_entry é a única fonte dos parâmetros de geração
  // agora (não duplicados em `presentation`), então falha aqui não pode ser
  // engolida: propaga e derruba a criação da presentation também.
  async function logCustomEntry(presentationId: string, input: {
    type: number
    language: number
    prompt: string
    aspectRatio: number
    slideCount: number
    amount: number
    audience: number
    scenario: number
    theme: number
    keywords?: string[]
    sourceSuggestionId?: string
  }, client?: DbClient) {
    return presentationEntryRepository().createCustom({
      kind: PresentationEntryKind.custom,
      presentationId,
      sourceSuggestionId: input.sourceSuggestionId ?? null,
      type: input.type,
      language: input.language,
      prompt: input.prompt,
      aspectRatio: input.aspectRatio,
      slideCount: input.slideCount,
      amount: input.amount,
      audience: input.audience,
      scenario: input.scenario,
      theme: input.theme,
      keywords: input.keywords,
    }, client)
  }

  return { listSuggestions, logCustomEntry }
}

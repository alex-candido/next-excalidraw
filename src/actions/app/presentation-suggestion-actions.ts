import { apiFetch } from "@/actions/api-client"
import type { PresentationEntrySuggestion } from "@/schemas/app/presentation-entry-schema"

const BASE = "/api/v1/app/presentation-suggestions"

export function presentationSuggestionActions() {
  async function list(params: { type: number; language: number; limit?: number; exclude?: string[] }) {
    const query = new URLSearchParams({
      type: String(params.type),
      language: String(params.language),
    })
    if (params.limit) query.set("limit", String(params.limit))
    if (params.exclude?.length) query.set("exclude", params.exclude.join(","))

    const { suggestions } = await apiFetch<{ suggestions: PresentationEntrySuggestion[] }>(`${BASE}?${query}`)
    return suggestions
  }

  return { list }
}

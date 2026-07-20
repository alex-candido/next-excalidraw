import { apiFetch } from "@/actions/api-client"
import type { GenerationStatusSummary } from "@/schemas/app/generation-schema"

const base = (presentationId: string) => `/api/v1/app/presentations/${presentationId}/generations`

export function generationActions() {
  async function status(presentationId: string, type: "slide" | "outline") {
    return apiFetch<GenerationStatusSummary>(`${base(presentationId)}?type=${type}`)
  }

  return { status }
}

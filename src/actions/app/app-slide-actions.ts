import { apiFetch } from "@/actions/api-client"
import type {
  Slide,
  SlideBulkUpdate,
  SlideGenerate,
  SlideGenerateResult,
  SlideRegenerate,
  SlideRegenerateResult,
} from "@/schemas/app/slide-schema"

const base = (presentationId: string) => `/api/v1/app/presentations/${presentationId}/slides`

export function slideActions() {
  async function list(presentationId: string) {
    const { slides } = await apiFetch<{ slides: Slide[] }>(base(presentationId))
    return slides
  }

  async function generate(presentationId: string, input: SlideGenerate) {
    return apiFetch<SlideGenerateResult>(`${base(presentationId)}/generate`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  async function bulkUpdate(presentationId: string, input: SlideBulkUpdate) {
    const { updated } = await apiFetch<{ updated: number }>(base(presentationId), {
      method: "PATCH",
      body: JSON.stringify(input),
    })
    return updated
  }

  async function regenerate(presentationId: string, slideId: string, input: SlideRegenerate) {
    return apiFetch<SlideRegenerateResult>(`${base(presentationId)}/${slideId}/generate`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  return { list, generate, bulkUpdate, regenerate }
}

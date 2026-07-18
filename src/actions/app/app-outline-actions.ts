import { apiFetch } from "@/actions/api-client"
import type {
  OutlineBulkUpdate,
  OutlineRegenerate,
  OutlineRegenerateAll,
  OutlineRegenerateAllResponse,
  OutlineRegenerateResponse,
} from "@/schemas/app/presentations/multi-schema"

const base = (presentationId: string) => `/api/v1/app/presentations/${presentationId}/outlines`

export function outlineActions() {
  async function bulkUpdate(presentationId: string, input: OutlineBulkUpdate) {
    const { updated } = await apiFetch<{ updated: number }>(base(presentationId), {
      method: "PATCH",
      body: JSON.stringify(input),
    })
    return updated
  }

  async function regenerate(presentationId: string, outlineId: string, input: OutlineRegenerate) {
    return apiFetch<OutlineRegenerateResponse>(`${base(presentationId)}/${outlineId}/generate`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  async function regenerateAll(presentationId: string, input: OutlineRegenerateAll) {
    return apiFetch<OutlineRegenerateAllResponse>(`${base(presentationId)}/regenerate-all`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  return { bulkUpdate, regenerate, regenerateAll }
}

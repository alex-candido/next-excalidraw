import { apiFetch } from "@/actions/api-client"
import type {
  Presentation,
  PresentationCreate,
  PresentationCreateResult,
  PresentationGenerate,
  PresentationGenerateResponse,
  PresentationWithOutlines,
} from "@/schemas/app/presentation-schema"

const BASE = "/api/v1/app/presentations"

export function presentationActions() {
  async function list() {
    const { presentations } = await apiFetch<{ presentations: Presentation[] }>(BASE)
    return presentations
  }

  async function findById(id: string) {
    return apiFetch<PresentationWithOutlines>(`${BASE}/${id}`)
  }

  async function create(input: PresentationCreate) {
    return apiFetch<PresentationCreateResult>(BASE, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  async function moveToTrash(id: string) {
    await apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" })
  }

  async function generateOutline(id: string, input: PresentationGenerate) {
    return apiFetch<PresentationGenerateResponse>(`${BASE}/${id}/outlines/generate`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  return { list, findById, create, moveToTrash, generateOutline }
}

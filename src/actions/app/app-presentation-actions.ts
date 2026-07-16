import { apiFetch } from "@/actions/api-client"
import type {
  Presentation,
  PresentationCreate,
  PresentationCreateResult,
  PresentationDuplicateResult,
  PresentationGenerate,
  PresentationGenerateResponse,
  PresentationRename,
  PresentationRenameResult,
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

  async function rename(id: string, input: PresentationRename) {
    return apiFetch<PresentationRenameResult>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    })
  }

  async function duplicate(id: string) {
    return apiFetch<PresentationDuplicateResult>(`${BASE}/${id}/duplicate`, { method: "POST" })
  }

  async function generateOutline(id: string, input: PresentationGenerate) {
    return apiFetch<PresentationGenerateResponse>(`${BASE}/${id}/outlines/generate`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  return { list, findById, create, moveToTrash, rename, duplicate, generateOutline }
}

import { apiFetch } from "@/actions/api-client"
import type {
  Presentation,
  PresentationCreate,
  PresentationCreateResult,
  PresentationDuplicateResult,
  PresentationGenerate,
  PresentationGenerateResponse,
  PresentationListQuery,
  PresentationRename,
  PresentationRenameResult,
  PresentationWithOutlines,
} from "@/schemas/app/presentation-schema"

const BASE = "/api/v1/app/presentations"

export interface PresentationListParams {
  tab?: PresentationListQuery["tab"]
  visibility?: PresentationListQuery["visibility"]
  q?: string
  cursor?: string
  limit?: number
}

export interface PresentationListResult {
  presentations: Presentation[]
  nextCursor: string | null
}

export function presentationActions() {
  async function list(params: PresentationListParams = {}) {
    const query = new URLSearchParams()
    if (params.tab) query.set("tab", params.tab)
    if (params.visibility) query.set("visibility", params.visibility)
    if (params.q) query.set("q", params.q)
    if (params.cursor) query.set("cursor", params.cursor)
    if (params.limit) query.set("limit", String(params.limit))

    return apiFetch<PresentationListResult>(`${BASE}?${query.toString()}`)
  }

  async function trashCount() {
    return apiFetch<{ count: number }>(`${BASE}/trash`)
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

  async function restore(id: string) {
    await apiFetch<void>(`${BASE}/${id}/restore`, { method: "POST" })
  }

  async function deletePermanently(id: string) {
    await apiFetch<void>(`${BASE}/${id}/permanent`, { method: "DELETE" })
  }

  async function favorite(id: string) {
    await apiFetch<void>(`${BASE}/${id}/favorite`, { method: "POST" })
  }

  async function unfavorite(id: string) {
    await apiFetch<void>(`${BASE}/${id}/favorite`, { method: "DELETE" })
  }

  async function favoritesCount() {
    return apiFetch<{ count: number }>(`${BASE}/favorites/count`)
  }

  async function restoreAll() {
    return apiFetch<{ count: number }>(`${BASE}/trash/restore`, { method: "POST" })
  }

  async function emptyTrash() {
    return apiFetch<{ count: number }>(`${BASE}/trash`, { method: "DELETE" })
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

  return {
    list,
    trashCount,
    findById,
    create,
    moveToTrash,
    restore,
    deletePermanently,
    favorite,
    unfavorite,
    favoritesCount,
    restoreAll,
    emptyTrash,
    rename,
    duplicate,
    generateOutline,
  }
}

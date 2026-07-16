import { ApiError } from "@/actions/api-client"
import type { Attachment, AttachmentCreateLink } from "@/schemas/app/attachment-schema"

const BASE = "/api/v1/app/presentations"

// Não reaproveita `apiFetch` (força Content-Type: application/json) — upload de
// arquivo precisa de multipart/form-data, o browser define o boundary sozinho.
async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const error = body?.error
    const message = typeof error === "string" ? error : error ? JSON.stringify(error) : res.statusText
    throw new ApiError(res.status, message)
  }
  return res.json()
}

export function attachmentActions() {
  async function list(presentationId: string) {
    const res = await fetch(`${BASE}/${presentationId}/attachments`)
    const { attachments } = await parseResponse<{ attachments: Attachment[] }>(res)
    return attachments
  }

  async function uploadFile(presentationId: string, kind: "image" | "file", file: File) {
    const formData = new FormData()
    formData.append("kind", kind)
    formData.append("file", file)

    const res = await fetch(`${BASE}/${presentationId}/attachments`, {
      method: "POST",
      body: formData,
    })
    return parseResponse<Attachment>(res)
  }

  async function createLink(presentationId: string, input: AttachmentCreateLink) {
    const res = await fetch(`${BASE}/${presentationId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    return parseResponse<Attachment>(res)
  }

  return { list, uploadFile, createLink }
}

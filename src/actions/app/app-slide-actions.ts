import { apiFetch } from "@/actions/api-client"
import type {
  Slide,
  SlideBulkUpdate,
  SlideGenerate,
  SlideGenerateResponse,
  SlideManualCreate,
  SlideManualCreateResult,
  SlideRegenerate,
  SlideRegenerateResponse,
  SlideThumbnailUpdate,
} from "@/schemas/app/slide-schema"

const base = (presentationId: string) => `/api/v1/app/presentations/${presentationId}/slides`

export function slideActions() {
  async function list(presentationId: string) {
    const { slides } = await apiFetch<{ slides: Slide[] }>(base(presentationId))
    return slides
  }

  async function generate(presentationId: string, input: SlideGenerate) {
    return apiFetch<SlideGenerateResponse>(`${base(presentationId)}/generate`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  async function createManual(presentationId: string, input: SlideManualCreate) {
    return apiFetch<SlideManualCreateResult>(base(presentationId), {
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
    return apiFetch<SlideRegenerateResponse>(`${base(presentationId)}/${slideId}/generate`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  // Caminho isolado (fora do bulkUpdate) pra preencher a capa quando o
  // usuário nunca clicou em "Salvar" — elements não mudou, só falta o
  // thumbnail. Ver use-app-studio-hydration.ts.
  async function setThumbnail(presentationId: string, slideId: string, input: SlideThumbnailUpdate) {
    return apiFetch<{ thumbnail: string | null }>(`${base(presentationId)}/${slideId}/thumbnail`, {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  return { list, generate, createManual, bulkUpdate, regenerate, setThumbnail }
}

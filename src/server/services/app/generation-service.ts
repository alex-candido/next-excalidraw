import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { GenerationStatus as GenerationRowStatus } from "@/lib/drizzle/schema/generation"
import type { GenerationStatusSummary } from "@/schemas/app/generation-schema"

export function generationService() {
  async function status(presentationId: string, userId: string, type: number): Promise<GenerationStatusSummary> {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const rows = await generationRepository().findByPresentationIdAndType(presentationId, type)
    const completed = rows.filter((r) => r.status === GenerationRowStatus.completed).length
    const failed    = rows.filter((r) => r.status === GenerationRowStatus.failed).length

    return { total: rows.length, completed, failed, pending: rows.length - completed - failed }
  }

  return { status }
}

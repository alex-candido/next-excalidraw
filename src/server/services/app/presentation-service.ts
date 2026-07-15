import { randomBytes } from "crypto"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { PresentationStatus } from "@/lib/drizzle/schema/presentation"
import type { PresentationCreate } from "@/schemas/app/presentation-schema"

function generateCode() {
  return randomBytes(4).toString("hex")
}

export function presentationService() {
  async function create(userId: string, input: PresentationCreate) {
    const code = generateCode()
    const slug = code

    const row = await presentationRepository().create({
      userId,
      code,
      slug,
      type:        input.type,
      title:       input.title?.trim() || "Untitled",
      userPrompt:  input.userPrompt ?? null,
      language:    input.language,
      aspectRatio: input.aspectRatio,
      slideCount:  input.slideCount,
      keywords:    input.keywords,
      status:      PresentationStatus.draft,
    })

    return { presentationId: row.id, type: row.type }
  }

  async function findById(id: string, userId: string) {
    const presentation = await presentationRepository().findById(id)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    return presentation
  }

  async function moveToTrash(id: string, userId: string) {
    await findById(id, userId)
    return presentationRepository().update(id, { status: PresentationStatus.trash })
  }

  return { create, findById, moveToTrash }
}

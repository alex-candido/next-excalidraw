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
      title:       "",
      userPrompt:  input.userPrompt,
      language:    input.language,
      aspectRatio: input.aspectRatio,
      slideCount:  input.slideCount,
      keywords:    input.keywords,
      status:      PresentationStatus.draft,
    })

    return { presentationId: row.id, type: row.type }
  }

  return { create }
}

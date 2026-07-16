import { randomBytes } from "crypto"
import { db } from "@/lib/drizzle"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { outlineRepository } from "@/server/repositories/app/outline-repository"
import { presentationEntryService } from "@/server/services/app/presentation-entry-service"
import { PresentationStatus } from "@/lib/drizzle/schema/presentation"
import type { PresentationCreate } from "@/schemas/app/presentation-schema"

function generateCode() {
  return randomBytes(4).toString("hex")
}

export function presentationService() {
  async function create(userId: string, input: PresentationCreate) {
    const code = generateCode()
    const slug = code

    // Transação: presentation sem presentation_entry é inutilizável (não sobra
    // parâmetro de geração em lugar nenhum) — se o insert da entry falhar, o
    // insert da presentation também precisa desfazer, não pode ficar órfã.
    return db.transaction(async (tx) => {
      const row = await presentationRepository().create({
        userId,
        code,
        slug,
        title:  input.title?.trim() || "Untitled",
        status: PresentationStatus.draft,
      }, tx)

      // Sempre cria uma presentation_entry nova (kind=custom, 1:1 com a
      // presentation) — seja o prompt/parâmetros 100% digitados pelo usuário ou
      // vindos de uma suggestion sem edição (ver decisions.md). sourceSuggestionId
      // só preenche source_suggestion_id, pra métrica de popularidade — nunca
      // pula a criação da entry em si.
      await presentationEntryService().logCustomEntry(row.id, {
        type: input.type,
        language: input.language,
        prompt: input.userPrompt ?? "",
        aspectRatio: input.aspectRatio,
        slideCount: input.slideCount,
        amount: input.amount,
        audience: input.audience,
        scenario: input.scenario,
        theme: input.theme,
        keywords: input.keywords,
        sourceSuggestionId: input.sourceSuggestionId,
      }, tx)

      return { presentationId: row.id, type: input.type }
    })
  }

  async function findById(id: string, userId: string) {
    const presentation = await presentationRepository().findById(id)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const outlines = await outlineRepository().findByPresentationId(id)
    return { ...presentation, outlines }
  }

  async function moveToTrash(id: string, userId: string) {
    await findById(id, userId)
    return presentationRepository().update(id, { status: PresentationStatus.trash })
  }

  return { create, findById, moveToTrash }
}

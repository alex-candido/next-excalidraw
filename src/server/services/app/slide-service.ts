import { db } from "@/lib/drizzle"
import { mastra } from "@/lib/mastra"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { outlineRepository } from "@/server/repositories/app/outline-repository"
import { slideRepository } from "@/server/repositories/app/slide-repository"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { GenerationType, GenerationStatus } from "@/lib/drizzle/schema/generation"
import { SlideStatus } from "@/lib/drizzle/schema/slide"
import type { SlideGenerate, SlideBulkUpdate, SlideRegenerate, SlideManualCreate } from "@/schemas/app/slide-schema"
import type { SlideWorkflowOutput } from "@/schemas/app/slide-schema"

function toTypeKey(n: number): string {
  return Object.entries(OutlineType).find(([, v]) => v === n)?.[0] ?? "content"
}

function toRepKey(n: number): string {
  return Object.entries(OutlineRepresentation).find(([, v]) => v === n)?.[0] ?? "auto"
}

export function slideService() {
  async function generate(presentationId: string, userId: string, input: SlideGenerate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const results: { id: string; order: number; outlineId: string }[] = []

    for (const [index, item] of input.outlines.entries()) {
      const gen = await generationRepository().create({
        presentationId,
        type:   GenerationType.slide,
        status: GenerationStatus.pending,
      })

      try {
        const workflow = mastra.getWorkflow("slideWorkflow")
        const run      = await workflow.createRun()
        const { result } = await run.start({
          inputData: {
            outlineId:      item.outlineId,
            order:          index,
            type:           toTypeKey(item.type),
            title:          item.title,
            description:    item.description,
            concepts:       item.concepts,
            representation: toRepKey(item.representation),
            layout:         item.layout,
            language:       presentation.entry.language,
            aspectRatio:    presentation.entry.aspectRatio,
            amount:         presentation.entry.amount,
            audience:       presentation.entry.audience,
            scenario:       presentation.entry.scenario,
            theme:          presentation.entry.theme,
          },
        }) as { result: SlideWorkflowOutput }

        const slide = await slideRepository().create({
          presentationId,
          outlineId: item.outlineId,
          order:     index,
          elements:  result.elements as unknown[],
          appState:  {},
          files:     {},
          status:    SlideStatus.active,
        })

        await generationRepository().update(gen.id, {
          status:      GenerationStatus.completed,
          completedAt: new Date(),
          usage:       result.metadata.usage as Record<string, unknown>,
          model:       { name: result.metadata.model } as Record<string, unknown>,
        })

        results.push({ id: slide.id, order: slide.order, outlineId: slide.outlineId })
      } catch {
        await generationRepository().update(gen.id, {
          status:      GenerationStatus.failed,
          completedAt: new Date(),
        })
      }
    }

    return { presentationId, slides: results }
  }

  async function bulkUpdate(presentationId: string, userId: string, input: SlideBulkUpdate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    // Reorder/exclusão do Studio ficam locais até o Save (mesmo padrão de
    // onAddSlide/createManual) — deletedIds resolve pra outlineId pareado e
    // apaga o outline (cascade cuida do slide, ver schema/slide.ts). Ids que
    // não pertencem a essa presentation são ignorados, nunca confiados às cegas.
    if (input.deletedIds?.length) {
      const toDelete = await slideRepository().findManyByIds(input.deletedIds, presentationId)
      await outlineRepository().deleteByIds(toDelete.map((s) => s.outlineId))
    }

    const updated = await slideRepository().bulkUpdate(input.slides)
    return { updated }
  }

  async function regenerate(presentationId: string, slideId: string, generationId: string, userId: string, input: SlideRegenerate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const existing = await slideRepository().findById(slideId)
    if (!existing) throw Object.assign(new Error("Slide not found"), { status: 404 })

    try {
      const workflow = mastra.getWorkflow("slideWorkflow")
      const run      = await workflow.createRun()
      const { result } = await run.start({
        inputData: {
          outlineId:      input.outlineId,
          order:          existing.order,
          type:           toTypeKey(input.type),
          title:          input.title,
          description:    input.description,
          concepts:       input.concepts,
          representation: toRepKey(input.representation),
          layout:         input.layout,
          language:       presentation.entry.language,
          aspectRatio:    presentation.entry.aspectRatio,
          amount:         presentation.entry.amount,
          audience:       presentation.entry.audience,
          scenario:       presentation.entry.scenario,
          theme:          presentation.entry.theme,
        },
      }) as { result: SlideWorkflowOutput }

      const updated = await slideRepository().update(slideId, {
        elements: result.elements as unknown[],
        appState: {},
      })

      await generationRepository().update(generationId, {
        status:      GenerationStatus.completed,
        completedAt: new Date(),
        usage:       result.metadata.usage as Record<string, unknown>,
        model:       { name: result.metadata.model } as Record<string, unknown>,
      })

      return { id: updated.id, order: updated.order, outlineId: updated.outlineId }
    } catch (err) {
      await generationRepository().update(generationId, {
        status:      GenerationStatus.failed,
        completedAt: new Date(),
      })
      throw err
    }
  }

  // SVG (exportToSvg, serializado em texto) calculado no client — sem
  // upload/storage/validação de arquivo, só grava o texto direto no campo
  // `thumbnail` (text). Ver docs/adr.md.
  async function setThumbnail(presentationId: string, slideId: string, userId: string, thumbnail: string) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const slide = await slideRepository().findById(slideId)
    if (!slide || slide.presentationId !== presentationId) throw Object.assign(new Error("Slide not found"), { status: 404 })

    return slideRepository().updateThumbnail(slideId, thumbnail)
  }

  // Slide adicionado manualmente no Studio (add-slide) só persiste aqui, no
  // save — antes disso ele só existe local (isLocal no Zustand). Todo slide
  // precisa de um outline (FK obrigatória), então cria os dois juntos: o
  // primeiro outline que a presentation ganhar (do zero ou nesta mesma leva)
  // é sempre type=cover, os seguintes são content — mesma regra usada em
  // qualquer presentation (ver findCoverSlide no client).
  async function createManual(presentationId: string, userId: string, input: SlideManualCreate["slides"]) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const existingOutlines = await outlineRepository().findByPresentationId(presentationId)
    let hasCover = existingOutlines.some((o) => o.type === OutlineType.cover)

    return db.transaction(async (tx) => {
      const created: { tempId: string; id: string; outlineId: string; order: number; type: number }[] = []

      for (const item of input) {
        const type = hasCover ? OutlineType.content : OutlineType.cover
        hasCover = true

        const [outline] = await outlineRepository().createMany([{
          presentationId,
          order: item.order,
          type,
          title: item.title,
          representation: OutlineRepresentation.auto,
        }], tx)

        const [slide] = await slideRepository().createMany([{
          presentationId,
          outlineId: outline.id,
          order: item.order,
          elements: [],
          appState: {},
          files: {},
          status: SlideStatus.active,
        }], tx)

        created.push({ tempId: item.tempId, id: slide.id, outlineId: outline.id, order: slide.order, type })
      }

      return created
    })
  }

  return { generate, bulkUpdate, regenerate, setThumbnail, createManual }
}

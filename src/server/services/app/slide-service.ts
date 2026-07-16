import { mastra } from "@/lib/mastra"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { slideRepository } from "@/server/repositories/app/slide-repository"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { GenerationType, GenerationStatus } from "@/lib/drizzle/schema/generation"
import { SlideStatus } from "@/lib/drizzle/schema/slide"
import type { SlideGenerate, SlideBulkUpdate, SlideRegenerate } from "@/schemas/app/slide-schema"
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
            order:          index + 1,
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
          order:     index + 1,
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

  return { generate, bulkUpdate, regenerate }
}

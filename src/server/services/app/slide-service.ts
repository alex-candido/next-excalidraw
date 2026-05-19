import { mastra } from "@/lib/mastra"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { slideRepository } from "@/server/repositories/app/slide-repository"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { GenerationType, GenerationStatus } from "@/lib/drizzle/schema/generation"
import { SlideStatus } from "@/lib/drizzle/schema/slide"
import type { SlideGenerate } from "@/schemas/app/slide-schema"
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
            language:       presentation.language,
            aspectRatio:    presentation.aspectRatio,
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

  return { generate }
}

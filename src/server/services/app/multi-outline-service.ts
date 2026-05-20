import { mastra } from "@/lib/mastra"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { outlineRepository } from "@/server/repositories/app/outline-repository"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { PresentationStatus } from "@/lib/drizzle/schema/presentation"
import { GenerationType, GenerationStatus } from "@/lib/drizzle/schema/generation"
import type { OutlineWorkflowOutput } from "@/schemas/app/outline-schema"
import type { MultiGenerate, OutlineRegenerate, OutlineBulkUpdate } from "@/schemas/app/presentations/multi-schema"

function slugify(text: string, code: string) {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${base}-${code}`
}

export function multiOutlineService() {
  async function generate(presentationId: string, userId: string, input: MultiGenerate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const gen = await generationRepository().create({
      presentationId,
      type:   GenerationType.outline,
      status: GenerationStatus.pending,
    })

    try {
      const workflow = mastra.getWorkflow("multiOutlineWorkflow")
      const run      = await workflow.createRun()
      const { result } = await run.start({ inputData: input }) as { result: OutlineWorkflowOutput }

      const outlines = await outlineRepository().createMany(
        result.outlines.map((item, i) => ({
          presentationId,
          order:          item.order ?? i + 1,
          type:           OutlineType[item.type as keyof typeof OutlineType],
          title:          item.title,
          description:    item.description,
          concepts:       item.concepts,
          representation: OutlineRepresentation[item.representation as keyof typeof OutlineRepresentation],
          layout:         item.layout,
        })),
      )

      await presentationRepository().update(presentationId, {
        title:  result.title,
        slug:   slugify(result.title, presentation.code),
        status: PresentationStatus.active,
      })

      await generationRepository().update(gen.id, {
        status:      GenerationStatus.completed,
        completedAt: new Date(),
        usage:       result.metadata.usage as Record<string, unknown>,
        model:       { name: result.metadata.model } as Record<string, unknown>,
      })

      return {
        presentationId,
        title: result.title,
        outlines: outlines.map((o) => ({
          id:             o.id,
          order:          o.order,
          type:           o.type,
          title:          o.title,
          description:    o.description,
          concepts:       o.concepts,
          representation: o.representation,
          layout:         o.layout,
        })),
      }
    } catch (err) {
      await generationRepository().update(gen.id, {
        status:      GenerationStatus.failed,
        completedAt: new Date(),
      })
      throw err
    }
  }

  async function bulkUpdate(presentationId: string, userId: string, input: OutlineBulkUpdate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const updated = await outlineRepository().bulkUpdate(input.outlines)
    return { updated }
  }

  async function regenerate(presentationId: string, outlineId: string, userId: string, input: OutlineRegenerate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const typeKey = Object.entries(OutlineType).find(([, v]) => v === input.type)?.[0] ?? "content"

    const workflow = mastra.getWorkflow("multiOutlineWorkflow")
    const run      = await workflow.createRun()
    const { result } = await run.start({
      inputData: {
        userPrompt: input.userPrompt,
        language:   input.language,
        slideCount: 1,
      },
    }) as { result: OutlineWorkflowOutput }

    const item = result.outlines[0]
    if (!item) throw new Error("Workflow returned no outlines")

    const updated = await outlineRepository().update(outlineId, {
      title:          item.title,
      description:    item.description,
      representation: OutlineRepresentation[item.representation as keyof typeof OutlineRepresentation],
    })

    return {
      id:             updated.id,
      order:          updated.order,
      type:           updated.type,
      title:          updated.title,
      description:    updated.description,
      concepts:       updated.concepts,
      representation: updated.representation,
      layout:         updated.layout,
    }
  }

  return { generate, bulkUpdate, regenerate }
}

import { mastra } from "@/lib/mastra"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { outlineRepository } from "@/server/repositories/app/outline-repository"
import { slideRepository } from "@/server/repositories/app/slide-repository"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { PresentationStatus } from "@/lib/drizzle/schema/presentation"
import { GenerationType, GenerationStatus } from "@/lib/drizzle/schema/generation"
import { SlideStatus } from "@/lib/drizzle/schema/slide"
import type { SingleGenerate, SingleWorkflowOutput } from "@/schemas/app/presentations/single-schema"
import type { SlideWorkflowOutput } from "@/schemas/app/slide-schema"

function slugify(text: string, code: string) {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${base}-${code}`
}

export function singleOutlineService() {
  async function generate(presentationId: string, generationId: string, userId: string, input: SingleGenerate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    // Step 1: generate outline (usa o generationId já criado pelo caller)
    let outlineId:    string
    let outlineTitle: string
    let outlineRep:   string
    let outlineItem:  SingleWorkflowOutput["outlines"][number]

    try {
      const workflow   = mastra.getWorkflow("singleOutlineWorkflow")
      const run        = await workflow.createRun()
      const { result } = await run.start({ inputData: input }) as { result: SingleWorkflowOutput }

      const item = result.outlines[0]
      if (!item) throw new Error("Workflow returned no outline")

      const [saved] = await outlineRepository().createMany([{
        presentationId,
        order:          1,
        type:           OutlineType.content,
        title:          item.title,
        description:    item.description,
        concepts:       item.concepts,
        representation: OutlineRepresentation[item.representation as keyof typeof OutlineRepresentation] ?? OutlineRepresentation.auto,
        layout:         item.layout,
      }])

      outlineId    = saved.id
      outlineTitle = result.title
      outlineRep   = item.representation
      outlineItem  = item

      await presentationRepository().update(presentationId, {
        title:  result.title,
        slug:   slugify(result.title, presentation.code),
        status: PresentationStatus.active,
      })

      await generationRepository().update(generationId, {
        status:      GenerationStatus.completed,
        completedAt: new Date(),
        usage:       result.metadata.usage as Record<string, unknown>,
        model:       { name: result.metadata.model } as Record<string, unknown>,
      })
    } catch (err) {
      await generationRepository().update(generationId, {
        status:      GenerationStatus.failed,
        completedAt: new Date(),
      })
      throw err
    }

    // Step 2: generate slide
    const slideGen = await generationRepository().create({
      presentationId,
      type:   GenerationType.slide,
      status: GenerationStatus.pending,
    })

    try {
      const workflow   = mastra.getWorkflow("slideWorkflow")
      const run        = await workflow.createRun()
      const { result } = await run.start({
        inputData: {
          outlineId,
          order:          1,
          type:           "content",
          title:          outlineItem.title,
          description:    outlineItem.description,
          concepts:       outlineItem.concepts,
          representation: outlineRep,
          layout:         outlineItem.layout,
          language:       input.language,
          aspectRatio:    presentation.aspectRatio,
          amount:         presentation.amount,
          audience:       presentation.audience,
          scenario:       presentation.scenario,
          theme:          presentation.theme,
        },
      }) as { result: SlideWorkflowOutput }

      const slide = await slideRepository().create({
        presentationId,
        outlineId,
        order:    1,
        elements: result.elements as unknown[],
        appState: {},
        files:    {},
        status:   SlideStatus.active,
      })

      await generationRepository().update(slideGen.id, {
        status:      GenerationStatus.completed,
        completedAt: new Date(),
        usage:       result.metadata.usage as Record<string, unknown>,
        model:       { name: result.metadata.model } as Record<string, unknown>,
      })

      return { presentationId, outlineId, slideId: slide.id, title: outlineTitle }
    } catch (err) {
      await generationRepository().update(slideGen.id, {
        status:      GenerationStatus.failed,
        completedAt: new Date(),
      })
      throw err
    }
  }

  return { generate }
}

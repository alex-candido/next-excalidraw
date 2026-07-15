import { GenerationStatus } from "@/lib/drizzle/schema/generation"
import { inngest } from "@/lib/inngest/client"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { slideService } from "@/server/services/app/slide-service"

export interface SlideGenerateRequestedEventData {
  presentationId: string
  generationId: string
  userId: string
  input: {
    outlines: {
      outlineId: string
      type: number
      title: string
      description: string
      concepts: string[]
      representation: number
      layout: string
    }[]
  }
}

export const generateSlides = inngest.createFunction(
  { id: "generate-slides", triggers: { event: "presentation/slides.generate.requested" } },
  async ({ event, step }) => {
    const { presentationId, generationId, userId, input } = event.data as unknown as SlideGenerateRequestedEventData

    return step.run("generate", async () => {
      try {
        const result = await slideService().generate(presentationId, userId, input)
        await generationRepository().update(generationId, { status: GenerationStatus.completed, completedAt: new Date() })
        return result
      } catch (err) {
        await generationRepository().update(generationId, { status: GenerationStatus.failed, completedAt: new Date() })
        throw err
      }
    })
  },
)

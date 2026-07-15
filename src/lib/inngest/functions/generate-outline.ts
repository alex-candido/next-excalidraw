import { PresentationType } from "@/lib/drizzle/schema/presentation"
import { inngest } from "@/lib/inngest/client"
import { multiOutlineService } from "@/server/services/app/multi-outline-service"
import { singleOutlineService } from "@/server/services/app/single-outline-service"

export interface OutlineGenerateRequestedEventData {
  presentationId: string
  generationId: string
  userId: string
  presentationType: number
  input: {
    userPrompt: string
    language: number
    slideCount: number
    keywords?: string[]
  }
}

export const generateOutline = inngest.createFunction(
  { id: "generate-outline", triggers: { event: "presentation/outline.generate.requested" } },
  async ({ event, step }) => {
    const { presentationId, generationId, userId, presentationType, input } =
      event.data as unknown as OutlineGenerateRequestedEventData

    return step.run("generate", async () => {
      if (presentationType === PresentationType.single) {
        return singleOutlineService().generate(presentationId, generationId, userId, {
          userPrompt: input.userPrompt,
          language:   input.language,
        })
      }

      return multiOutlineService().generate(presentationId, generationId, userId, {
        userPrompt: input.userPrompt,
        language:   input.language,
        slideCount: input.slideCount,
        keywords:   input.keywords,
      })
    })
  },
)

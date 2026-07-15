import { inngest } from "@/lib/inngest/client"
import { slideService } from "@/server/services/app/slide-service"

export interface SlideRegenerateRequestedEventData {
  presentationId: string
  slideId: string
  generationId: string
  userId: string
  input: {
    outlineId: string
    type: number
    title: string
    description: string
    concepts: string[]
    representation: number
    layout: string
  }
}

export const regenerateSlide = inngest.createFunction(
  { id: "regenerate-slide", triggers: { event: "presentation/slide.regenerate.requested" } },
  async ({ event, step }) => {
    const { presentationId, slideId, generationId, userId, input } =
      event.data as unknown as SlideRegenerateRequestedEventData

    return step.run("regenerate", () =>
      slideService().regenerate(presentationId, slideId, generationId, userId, input),
    )
  },
)

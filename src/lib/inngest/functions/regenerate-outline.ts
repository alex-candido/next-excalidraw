import { inngest } from "@/lib/inngest/client"
import { multiOutlineService } from "@/server/services/app/multi-outline-service"

export interface OutlineRegenerateRequestedEventData {
  presentationId: string
  outlineId: string
  generationId: string
  userId: string
  input: {
    userPrompt: string
    language: number
    type: number
    order: number
  }
}

export const regenerateOutline = inngest.createFunction(
  { id: "regenerate-outline", triggers: { event: "presentation/outline.regenerate.requested" } },
  async ({ event, step }) => {
    const { presentationId, outlineId, generationId, userId, input } =
      event.data as unknown as OutlineRegenerateRequestedEventData

    return step.run("regenerate", () =>
      multiOutlineService().regenerate(presentationId, outlineId, generationId, userId, input),
    )
  },
)

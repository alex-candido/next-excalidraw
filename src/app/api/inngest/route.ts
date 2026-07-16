import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { generateOutline } from "@/lib/inngest/functions/generate-outline"
import { generateSlides } from "@/lib/inngest/functions/generate-slides"
import { scheduledMaintenance } from "@/lib/inngest/functions/scheduled-maintenance"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateOutline, generateSlides, scheduledMaintenance],
})

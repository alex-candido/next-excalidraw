import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { generateOutline } from "@/lib/inngest/functions/generate-outline"
import { regenerateOutline } from "@/lib/inngest/functions/regenerate-outline"
import { generateSlides } from "@/lib/inngest/functions/generate-slides"
import { regenerateSlide } from "@/lib/inngest/functions/regenerate-slide"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateOutline, regenerateOutline, generateSlides, regenerateSlide],
})

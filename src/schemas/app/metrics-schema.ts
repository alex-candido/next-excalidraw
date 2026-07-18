import { z } from "zod"

export const metricsSchema = z.object({
  presentations: z.object({
    total: z.number().int(),
    multi: z.number().int(),
    single: z.number().int(),
  }),
  generation: z.object({
    aiGenerated: z.number().int(),
    total: z.number().int(),
  }),
})

export type Metrics = z.infer<typeof metricsSchema>

import { z } from "zod"

export function generationResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion("status", [
    z.object({ status: z.literal("completed"), data: dataSchema }),
    z.object({ status: z.literal("pending"), generationId: z.string().uuid() }),
  ])
}

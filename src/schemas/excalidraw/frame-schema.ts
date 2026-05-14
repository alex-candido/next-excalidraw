import { z } from "zod"

export const frameInputSchema = z.object({
  id: z.string(),
  children: z.array(z.string()).min(1),
  name: z.string().optional(),
})

export type FrameInput = z.infer<typeof frameInputSchema>

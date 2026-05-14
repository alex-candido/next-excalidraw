import { z } from "zod"
import { strokeStyleSchema } from "./base-shape-schema"

export const lineInputSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().min(1).max(4).optional(),
  strokeStyle: strokeStyleSchema.optional(),
  roughness: z.number().min(0).max(2).optional(),
  opacity: z.number().min(0).max(100).optional(),
  groupIds: z.array(z.string()).optional(),
})

export type LineInput = z.infer<typeof lineInputSchema>

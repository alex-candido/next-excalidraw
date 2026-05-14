import { z } from "zod"
import { textAlignSchema, verticalAlignSchema } from "./base-shape-schema"

export const textInputSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  text: z.string().min(1),
  fontSize: z.number().optional(),
  fontFamily: z.number().optional(),
  strokeColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textAlign: textAlignSchema.optional(),
  verticalAlign: verticalAlignSchema.optional(),
  containerId: z.string().optional(),
  groupIds: z.array(z.string()).optional(),
  opacity: z.number().min(0).max(100).optional(),
})

export type TextInput = z.infer<typeof textInputSchema>

export const FONT = {
  virgil: 1,
  helvetica: 2,
  cascadia: 3,
  excalifont: 5,
} as const

export const TEXT_DEFAULTS = {
  fontSize: 20,
  fontFamily: FONT.excalifont,
} as const

import { z } from "zod"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { presentationWorkflowInputSchema } from "./presentation-schema"

const OUTLINE_TYPES    = Object.keys(OutlineType)    as [string, ...string[]]
const OUTLINE_REPS     = Object.keys(OutlineRepresentation) as [string, ...string[]]

export const outlineItemSchema = z.object({
  order:          z.number().int().min(1),
  type:           z.enum(OUTLINE_TYPES),
  title:          z.string(),
  description:    z.string(),
  concepts:       z.array(z.string()),
  representation: z.enum(OUTLINE_REPS),
  layout:         z.string(),
})

export const outlineWorkflowInputSchema  = presentationWorkflowInputSchema
export const outlineWorkflowOutputSchema = z.object({
  title:    z.string(),
  outlines: z.array(outlineItemSchema),
})

export type OutlineItem            = z.infer<typeof outlineItemSchema>
export type OutlineWorkflowInput   = z.infer<typeof outlineWorkflowInputSchema>
export type OutlineWorkflowOutput  = z.infer<typeof outlineWorkflowOutputSchema>

import { z } from "zod"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { presentationWorkflowInputSchema } from "./presentation-schema"

const OUTLINE_TYPES = Object.keys(OutlineType)           as [string, ...string[]]
const OUTLINE_REPS  = Object.keys(OutlineRepresentation) as [string, ...string[]]

export const slideWorkflowInputSchema = z.object({
  type:           z.enum(OUTLINE_TYPES),
  title:          z.string(),
  description:    z.string(),
  concepts:       z.array(z.string()),
  representation: z.enum(OUTLINE_REPS),
  layout:         z.string(),
  language:       presentationWorkflowInputSchema.shape.language,
})

export const slideWorkflowOutputSchema = z.object({
  elements: z.array(z.record(z.string(), z.unknown())),
})

export type SlideWorkflowInput  = z.infer<typeof slideWorkflowInputSchema>
export type SlideWorkflowOutput = z.infer<typeof slideWorkflowOutputSchema>

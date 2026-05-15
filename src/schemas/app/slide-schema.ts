import { z } from "zod"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { presentationWorkflowInputSchema } from "./presentation-schema"
import { workflowMetaBaseSchema } from "@/lib/mastra/utils/workflow-metadata"

const OUTLINE_TYPES = Object.keys(OutlineType)           as [string, ...string[]]
const OUTLINE_REPS  = Object.keys(OutlineRepresentation) as [string, ...string[]]

export const slideWorkflowInputSchema = z.object({
  outlineId:      z.string(),
  order:          z.number().int().min(1),
  type:           z.enum(OUTLINE_TYPES),
  title:          z.string(),
  description:    z.string(),
  concepts:       z.array(z.string()),
  representation: z.enum(OUTLINE_REPS),
  layout:         z.string(),
  language:       presentationWorkflowInputSchema.shape.language,
})

export const slideToolOutputSchema = z.object({
  elements: z.array(z.record(z.string(), z.unknown())),
})

const slideMetadataSchema = workflowMetaBaseSchema.extend({
  context: z.object({
    slideOrder: z.number(),
    outlineId:  z.string(),
  }),
})

export const slideWorkflowOutputSchema = z.object({
  elements: z.array(z.record(z.string(), z.unknown())),
  metadata: slideMetadataSchema,
})

export type SlideWorkflowInput  = z.infer<typeof slideWorkflowInputSchema>
export type SlideToolOutput     = z.infer<typeof slideToolOutputSchema>
export type SlideWorkflowOutput = z.infer<typeof slideWorkflowOutputSchema>

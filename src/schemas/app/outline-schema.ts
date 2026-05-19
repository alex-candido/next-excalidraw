import { z } from "zod"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { presentationWorkflowInputSchema } from "./presentation-schema"
import { workflowMetaBaseSchema } from "@/lib/mastra/mappers/workflow-metadata-mapper"

const OUTLINE_TYPES = Object.keys(OutlineType)           as [string, ...string[]]
const OUTLINE_REPS  = Object.keys(OutlineRepresentation) as [string, ...string[]]

export const REPRESENTATION_BY_TYPE: Record<string, string[]> = {
  cover:   ["auto", "infographic"],
  content: Object.keys(OutlineRepresentation),
  closing: ["auto", "infographic"],
}

export const outlineItemSchema = z.object({
  order:          z.number().int().min(1),
  type:           z.enum(OUTLINE_TYPES),
  title:          z.string(),
  description:    z.string(),
  concepts:       z.array(z.string()),
  representation: z.enum(OUTLINE_REPS),
  layout:         z.string(),
})

export const outlineToolOutputSchema = z.object({
  title:    z.string(),
  outlines: z.array(outlineItemSchema),
})

const outlineMetadataSchema = workflowMetaBaseSchema.extend({
  context: z.object({
    outlineCount:      z.number(),
    presentationTitle: z.string(),
  }),
})

export const outlineBulkUpdateSchema = z.object({
  outlines: z.array(z.object({
    id:             z.string().uuid(),
    title:          z.string(),
    description:    z.string(),
    representation: z.number().int(),
  })).min(1),
})

export const outlineRegenerateSchema = z.object({
  userPrompt: z.string().min(1),
  language:   z.number().int().default(0),
  type:       z.number().int(),
  order:      z.number().int().min(1),
})

export type OutlineBulkUpdate   = z.infer<typeof outlineBulkUpdateSchema>
export type OutlineRegenerate   = z.infer<typeof outlineRegenerateSchema>

export const outlineGenerateSchema = z.object({
  userPrompt:  z.string().min(1),
  language:    z.number().int().default(0),
  slideCount:  z.number().int().default(0),
  keywords:    z.array(z.string()).optional(),
})

export type OutlineGenerate = z.infer<typeof outlineGenerateSchema>

export const outlineWorkflowInputSchema  = presentationWorkflowInputSchema
export const outlineWorkflowOutputSchema = z.object({
  title:    z.string(),
  outlines: z.array(outlineItemSchema),
  metadata: outlineMetadataSchema,
})

export type OutlineItem           = z.infer<typeof outlineItemSchema>
export type OutlineToolOutput     = z.infer<typeof outlineToolOutputSchema>
export type OutlineWorkflowInput  = z.infer<typeof outlineWorkflowInputSchema>
export type OutlineWorkflowOutput = z.infer<typeof outlineWorkflowOutputSchema>

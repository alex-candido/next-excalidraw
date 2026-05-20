import { z } from "zod"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { workflowMetaBaseSchema } from "@/lib/mastra/mappers/workflow-metadata-mapper"

const OUTLINE_TYPES = Object.keys(OutlineType)           as [string, ...string[]]
const OUTLINE_REPS  = Object.keys(OutlineRepresentation) as [string, ...string[]]

export const outlineItemSchema = z.object({
  order:          z.number().int().min(1),
  type:           z.enum(OUTLINE_TYPES),
  title:          z.string(),
  description:    z.string().default(""),
  concepts:       z.array(z.string()).default([]),
  representation: z.enum(OUTLINE_REPS),
  layout:         z.string().default(""),
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

export const outlineWorkflowOutputSchema = z.object({
  title:    z.string(),
  outlines: z.array(outlineItemSchema),
  metadata: outlineMetadataSchema,
})

export type OutlineItem           = z.infer<typeof outlineItemSchema>
export type OutlineToolOutput     = z.infer<typeof outlineToolOutputSchema>
export type OutlineWorkflowOutput = z.infer<typeof outlineWorkflowOutputSchema>

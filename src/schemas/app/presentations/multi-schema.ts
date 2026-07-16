import { z } from "zod"
import { PresentationLanguage } from "@/lib/drizzle/schema/presentation"
import { OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { attachmentContextSchema } from "@/schemas/app/attachment-schema"
import { generationResponseSchema } from "@/schemas/app/generation-schema"
import { outlineWorkflowOutputSchema } from "@/schemas/app/outline-schema"

export const REPRESENTATION_BY_TYPE: Record<string, string[]> = {
  cover:   ["auto", "infographic"],
  content: Object.keys(OutlineRepresentation),
  closing: ["auto", "infographic"],
}

export const multiGenerateSchema = z.object({
  userPrompt: z.string().min(1),
  language:   z.number().int().default(PresentationLanguage.en),
  slideCount: z.number().int().default(0),
  keywords:   z.array(z.string()).optional(),
})

export const multiWorkflowInputSchema = z.object({
  userPrompt: z.string().min(1),
  language:   z.number().int().default(PresentationLanguage.en),
  slideCount: z.number().int().default(0),
  amount:     z.number().int().default(0),
  audience:   z.number().int().default(0),
  scenario:   z.number().int().default(0),
  theme:      z.number().int().default(0),
  keywords:   z.array(z.string()).optional(),
  attachments: z.array(attachmentContextSchema).optional(),
})

export const multiWorkflowOutputSchema = outlineWorkflowOutputSchema

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

export type MultiGenerate       = z.infer<typeof multiGenerateSchema>
export type MultiWorkflowInput  = z.infer<typeof multiWorkflowInputSchema>
export type MultiWorkflowOutput = z.infer<typeof multiWorkflowOutputSchema>
export type OutlineBulkUpdate   = z.infer<typeof outlineBulkUpdateSchema>
export type OutlineRegenerate   = z.infer<typeof outlineRegenerateSchema>

export const outlineRegenerateResultSchema = z.object({
  id:             z.string().uuid(),
  order:          z.number().int(),
  type:           z.number().int(),
  title:          z.string(),
  description:    z.string().nullable(),
  concepts:       z.array(z.string()).nullable(),
  representation: z.number().int(),
  layout:         z.string().nullable(),
})

export type OutlineRegenerateResult = z.infer<typeof outlineRegenerateResultSchema>

export const outlineRegenerateResponseSchema = generationResponseSchema(outlineRegenerateResultSchema)

export type OutlineRegenerateResponse = z.infer<typeof outlineRegenerateResponseSchema>

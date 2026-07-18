import { z } from "zod"
import { PresentationLanguage } from "@/lib/drizzle/schema/presentation"
import { OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { attachmentContextSchema } from "@/schemas/app/attachment-schema"
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
    concepts:       z.array(z.string()),
    representation: z.number().int(),
    layout:         z.string(),
  })).min(1),
})

export const outlineRegenerateSchema = z.object({
  userPrompt: z.string().min(1),
  language:   z.number().int().default(0),
  type:       z.number().int(),
  order:      z.number().int().min(1),
})

// "Regenerar tudo" — commita o rascunho de prompt+parâmetros (persiste em
// presentation_entry) e recria o outline inteiro do zero (pode mudar a
// quantidade de cenas se slideCount mudou). Diferente de outlineRegenerateSchema
// (regenera 1 item existente, mantém quantidade/ordem).
export const outlineRegenerateAllSchema = z.object({
  userPrompt:  z.string().min(1),
  language:    z.number().int().default(0),
  aspectRatio: z.number().int().default(0),
  slideCount:  z.number().int().default(0),
  audience:    z.number().int().default(0),
  scenario:    z.number().int().default(0),
  amount:      z.number().int().default(0),
  theme:       z.number().int().default(0),
})

export type MultiGenerate       = z.infer<typeof multiGenerateSchema>
export type MultiWorkflowInput  = z.infer<typeof multiWorkflowInputSchema>
export type MultiWorkflowOutput = z.infer<typeof multiWorkflowOutputSchema>
export type OutlineBulkUpdate   = z.infer<typeof outlineBulkUpdateSchema>
export type OutlineRegenerate   = z.infer<typeof outlineRegenerateSchema>
export type OutlineRegenerateAll = z.infer<typeof outlineRegenerateAllSchema>

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

export type OutlineRegenerateResponse = OutlineRegenerateResult

export const outlineRegenerateAllResponseSchema = z.object({
  title:    z.string(),
  outlines: z.array(outlineRegenerateResultSchema),
})

export type OutlineRegenerateAllResponse = z.infer<typeof outlineRegenerateAllResponseSchema>

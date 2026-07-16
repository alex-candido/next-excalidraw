import { z } from "zod"
import { PresentationLanguage } from "@/lib/drizzle/schema/presentation"
import { attachmentContextSchema } from "@/schemas/app/attachment-schema"
import { outlineWorkflowOutputSchema } from "@/schemas/app/outline-schema"

export const singleGenerateSchema = z.object({
  userPrompt: z.string().min(1),
  language:   z.number().int().default(PresentationLanguage.en),
})

export const singleWorkflowInputSchema = z.object({
  userPrompt: z.string().min(1),
  language:   z.number().int().default(PresentationLanguage.en),
  attachments: z.array(attachmentContextSchema).optional(),
})

export const singleWorkflowOutputSchema = outlineWorkflowOutputSchema

export type SingleGenerate       = z.infer<typeof singleGenerateSchema>
export type SingleWorkflowInput  = z.infer<typeof singleWorkflowInputSchema>
export type SingleWorkflowOutput = z.infer<typeof singleWorkflowOutputSchema>

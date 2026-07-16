import { z } from "zod"

export const presentationEntrySuggestionSchema = z.object({
  id:          z.string().uuid(),
  type:        z.number().int(),
  language:    z.number().int(),
  icon:        z.string().nullable(),
  title:       z.string().nullable(),
  description: z.string().nullable(),
  prompt:      z.string(),
  aspectRatio: z.number().int(),
  slideCount:  z.number().int(),
  amount:      z.number().int(),
  audience:    z.number().int(),
  scenario:    z.number().int(),
  theme:       z.number().int(),
  keywords:    z.array(z.string()).nullable(),
})

export type PresentationEntrySuggestion = z.infer<typeof presentationEntrySuggestionSchema>

export const presentationEntrySuggestionListSchema = z.object({
  type:     z.number().int(),
  language: z.number().int(),
  limit:    z.number().int().min(1).max(20).default(6),
  exclude:  z.array(z.string().uuid()).optional(),
})

export type PresentationEntrySuggestionList = z.infer<typeof presentationEntrySuggestionListSchema>

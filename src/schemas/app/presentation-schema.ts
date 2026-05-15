import { z } from "zod"
import { PresentationLanguage } from "@/lib/drizzle/schema/presentation"

export const LANGUAGE_NAMES: Record<number, string> = {
  [PresentationLanguage.en]:   "English",
  [PresentationLanguage.es]:   "Spanish",
  [PresentationLanguage.fr]:   "French",
  [PresentationLanguage.de]:   "German",
  [PresentationLanguage.it]:   "Italian",
  [PresentationLanguage.ptBR]: "Portuguese (Brazil)",
  [PresentationLanguage.ru]:   "Russian",
  [PresentationLanguage.zh]:   "Chinese",
  [PresentationLanguage.ja]:   "Japanese",
  [PresentationLanguage.ko]:   "Korean",
}

export const presentationWorkflowInputSchema = z.object({
  userPrompt: z.string().min(1),
  language:   z.number().int().default(PresentationLanguage.en),
  slideCount: z.number().int().default(0),
  keywords:   z.array(z.string()).optional(),
})

export type PresentationWorkflowInput = z.infer<typeof presentationWorkflowInputSchema>

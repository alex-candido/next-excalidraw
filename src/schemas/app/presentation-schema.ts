import { z } from "zod"
import {
  PresentationLanguage,
  PresentationType,
  PresentationAmount,
  PresentationAudience,
  PresentationScenario,
  PresentationTheme,
} from "@/lib/drizzle/schema/presentation"

export const AMOUNT_RANGE: Record<number, [number, number]> = {
  [PresentationAmount.auto]:      [4,  20],
  [PresentationAmount.minimal]:   [4,  6],
  [PresentationAmount.concise]:   [7,  10],
  [PresentationAmount.detailed]:  [11, 15],
  [PresentationAmount.extensive]: [16, 20],
}

export const AUDIENCE_HINTS: Record<number, string> = {
  [PresentationAudience.general]:  "Linguagem clara e acessível, sem jargão técnico",
  [PresentationAudience.business]: "Tom profissional, foco em resultados, ROI e impacto nos negócios",
  [PresentationAudience.investor]: "Dados concretos, métricas de crescimento, oportunidade de mercado e retorno",
  [PresentationAudience.teacher]:  "Didático e estruturado, conceitos em progressão lógica com exemplos",
  [PresentationAudience.student]:  "Linguagem engajante, simplificada, passo a passo, com analogias",
}

export const SCENARIO_HINTS: Record<number, string> = {
  [PresentationScenario.auto]:        "Adapte o estilo visual ao conteúdo do outline",
  [PresentationScenario.promotional]: "Visual impactante e persuasivo — use cores primárias, elementos de destaque e calls to action",
  [PresentationScenario.teaching]:    "Visual didático — use sequências numeradas, setas de fluxo e agrupamentos que guiam o olhar",
  [PresentationScenario.analytical]:  "Visual analítico — prefira tabelas, matrizes, comparações lado a lado e elementos que mostram relações de causa/efeito",
  [PresentationScenario.report]:      "Visual formal e limpo — estrutura hierárquica clara, sem decoração excessiva, foco na informação",
}

export const THEME_KEYS: Record<number, string> = {
  [PresentationTheme.daktilo]:    "daktilo",
  [PresentationTheme.noir]:       "noir",
  [PresentationTheme.cornflower]: "cornflower",
  [PresentationTheme.indigo]:     "indigo",
  [PresentationTheme.orbit]:      "orbit",
  [PresentationTheme.cosmos]:     "cosmos",
  [PresentationTheme.sunset]:     "sunset",
  [PresentationTheme.forest]:     "forest",
  [PresentationTheme.piano]:      "piano",
  [PresentationTheme.ebony]:      "ebony",
}

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

export const presentationCreateSchema = z.object({
  type:        z.number().int().default(PresentationType.multi),
  userPrompt:  z.string().min(1),
  language:    z.number().int().default(PresentationLanguage.en),
  aspectRatio: z.number().int().default(0),
  slideCount:  z.number().int().default(0),
  amount:      z.number().int().default(PresentationAmount.auto),
  audience:    z.number().int().default(PresentationAudience.general),
  scenario:    z.number().int().default(PresentationScenario.auto),
  theme:       z.number().int().default(PresentationTheme.daktilo),
  keywords:    z.array(z.string()).optional(),
})

export type PresentationCreate = z.infer<typeof presentationCreateSchema>

export const presentationWorkflowInputSchema = z.object({
  userPrompt: z.string().min(1),
  language:   z.number().int().default(PresentationLanguage.en),
  slideCount: z.number().int().default(0),
  amount:     z.number().int().default(PresentationAmount.auto),
  audience:   z.number().int().default(PresentationAudience.general),
  scenario:   z.number().int().default(PresentationScenario.auto),
  theme:      z.number().int().default(PresentationTheme.daktilo),
  keywords:   z.array(z.string()).optional(),
})

export type PresentationWorkflowInput = z.infer<typeof presentationWorkflowInputSchema>

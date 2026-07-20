import { z } from "zod"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { workflowMetaBaseSchema } from "@/lib/mastra/mappers/workflow-metadata-mapper"
import { AspectRatio, PresentationLanguage } from "@/lib/drizzle/schema/presentation"
import { generationResponseSchema } from "@/schemas/app/generation-schema"

const OUTLINE_TYPES  = Object.keys(OutlineType)           as [string, ...string[]]
const OUTLINE_REPS   = Object.keys(OutlineRepresentation) as [string, ...string[]]

export const CANVAS_DIMENSIONS: Record<number, { width: number; height: number; label: string }> = {
  [AspectRatio["16:9"]]: { width: 800, height: 450,  label: "16:9"  },
  [AspectRatio["4:3"]]:  { width: 800, height: 600,  label: "4:3"   },
  [AspectRatio["9:16"]]: { width: 450, height: 800,  label: "9:16"  },
  [AspectRatio["1:1"]]:  { width: 600, height: 600,  label: "1:1"   },
  [AspectRatio.A4]:      { width: 595, height: 842,  label: "A4"    },
  [AspectRatio.custom]:  { width: 800, height: 450,  label: "custom" },
}

export const slideWorkflowInputSchema = z.object({
  outlineId:      z.string(),
  order:          z.number().int().min(0),
  type:           z.enum(OUTLINE_TYPES),
  title:          z.string(),
  description:    z.string(),
  concepts:       z.array(z.string()),
  representation: z.enum(OUTLINE_REPS),
  layout:         z.string(),
  language:       z.number().int().default(PresentationLanguage.en),
  aspectRatio:    z.number().int().default(AspectRatio["16:9"]),
  amount:         z.number().int().optional(),
  audience:       z.number().int().optional(),
  scenario:       z.number().int().optional(),
  theme:          z.number().int().optional(),
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

export const slideGenerateItemSchema = z.object({
  outlineId:      z.string().uuid(),
  type:           z.number().int(),
  title:          z.string(),
  description:    z.string(),
  concepts:       z.array(z.string()),
  representation: z.number().int(),
  layout:         z.string(),
})

export const slideGenerateSchema = z.object({
  outlines: z.array(slideGenerateItemSchema).min(1),
})

export const slideBulkUpdateItemSchema = z.object({
  id:       z.string().uuid(),
  order:    z.number().int(),
  elements: z.array(z.record(z.string(), z.unknown())),
  appState: z.record(z.string(), z.unknown()).default({}),
  // SVG (exportToSvg, serializado em texto) do próprio slide, calculado no
  // client no mesmo save que persiste `elements`, nunca separado (evita o
  // campo dessincronizar do conteúdo real). Omitido quando o slide não
  // mudou desde o último cálculo (ver use-app-studio-save.ts).
  thumbnail: z.string().optional(),
})

export const slideBulkUpdateSchema = z.object({
  slides: z.array(slideBulkUpdateItemSchema),
  // Reorder/exclusão no Studio ficam só locais até o Save (mesmo padrão de
  // onAddSlide) — deletedIds é o que foi removido localmente desde a última
  // hidratação/save. Apaga o outline pareado (cascade cuida do slide, ver
  // schema/slide.ts: outlineId com onDelete "cascade"), nunca só o slide,
  // senão o outline órfão continua aparecendo no Outline sem slide nenhum.
  deletedIds: z.array(z.string().uuid()).optional(),
})

// Endpoint dedicado, separado do bulkUpdate — cobre o caso de um slide já
// existir sem thumbnail e o usuário nunca ter clicado em "Salvar" (elements
// não mudou, só falta preencher o campo). Ver use-app-studio-hydration.ts.
export const slideThumbnailUpdateSchema = z.object({
  thumbnail: z.string().min(1),
})

export const slideRegenerateSchema = z.object({
  outlineId:      z.string().uuid(),
  type:           z.number().int(),
  title:          z.string(),
  description:    z.string(),
  concepts:       z.array(z.string()),
  representation: z.number().int(),
  layout:         z.string(),
})

export type SlideGenerateItem    = z.infer<typeof slideGenerateItemSchema>
export type SlideGenerate        = z.infer<typeof slideGenerateSchema>
export type SlideBulkUpdateItem  = z.infer<typeof slideBulkUpdateItemSchema>
export type SlideThumbnailUpdate = z.infer<typeof slideThumbnailUpdateSchema>
export type SlideBulkUpdate      = z.infer<typeof slideBulkUpdateSchema>
export type SlideRegenerate      = z.infer<typeof slideRegenerateSchema>
export type SlideWorkflowInput   = z.infer<typeof slideWorkflowInputSchema>
export type SlideToolOutput      = z.infer<typeof slideToolOutputSchema>
export type SlideWorkflowOutput  = z.infer<typeof slideWorkflowOutputSchema>

export const slideSchema = z.object({
  id:             z.string().uuid(),
  presentationId: z.string().uuid(),
  outlineId:      z.string().uuid(),
  order:          z.number().int(),
  composition:    z.record(z.string(), z.unknown()).nullable(),
  elements:       z.array(z.record(z.string(), z.unknown())).nullable(),
  appState:       z.record(z.string(), z.unknown()).nullable(),
  files:          z.record(z.string(), z.unknown()).nullable(),
  thumbnail:      z.string().nullable(),
  status:         z.number().int(),
  createdAt:      z.string(),
  updatedAt:      z.string(),
})

export type Slide = z.infer<typeof slideSchema>

export const slideGenerateResultSchema = z.object({
  presentationId: z.string().uuid(),
  slides: z.array(z.object({
    id:        z.string().uuid(),
    order:     z.number().int(),
    outlineId: z.string().uuid(),
  })),
})

export type SlideGenerateResult = z.infer<typeof slideGenerateResultSchema>

export const slideGenerateResponseSchema = generationResponseSchema(slideGenerateResultSchema)

export type SlideGenerateResponse = z.infer<typeof slideGenerateResponseSchema>

export const slideRegenerateResultSchema = z.object({
  id:        z.string().uuid(),
  order:     z.number().int(),
  outlineId: z.string().uuid(),
})

export type SlideRegenerateResult = z.infer<typeof slideRegenerateResultSchema>

export type SlideRegenerateResponse = SlideRegenerateResult

// Slide adicionado manualmente no Studio (fica só local até o save) — o
// tempId é o id gerado no client (crypto.randomUUID()), devolvido junto pra
// o client trocar pelo id real sem precisar adivinhar qual é qual.
export const slideManualCreateSchema = z.object({
  slides: z.array(z.object({
    tempId: z.string(),
    order:  z.number().int(),
    title:  z.string(),
  })).min(1),
})

export type SlideManualCreate = z.infer<typeof slideManualCreateSchema>

export const slideManualCreateResultSchema = z.object({
  created: z.array(z.object({
    tempId:    z.string(),
    id:        z.string().uuid(),
    outlineId: z.string().uuid(),
    order:     z.number().int(),
    type:      z.number().int(),
  })),
})

export type SlideManualCreateResult = z.infer<typeof slideManualCreateResultSchema>

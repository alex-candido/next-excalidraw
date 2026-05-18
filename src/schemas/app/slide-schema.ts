import { z } from "zod"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { presentationWorkflowInputSchema } from "./presentation-schema"
import { workflowMetaBaseSchema } from "@/lib/mastra/mappers/workflow-metadata-mapper"
import { AspectRatio } from "@/lib/drizzle/schema/presentation"

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
  order:          z.number().int().min(1),
  type:           z.enum(OUTLINE_TYPES),
  title:          z.string(),
  description:    z.string(),
  concepts:       z.array(z.string()),
  representation: z.enum(OUTLINE_REPS),
  layout:         z.string(),
  language:       presentationWorkflowInputSchema.shape.language,
  aspectRatio:    z.number().int().default(AspectRatio["16:9"]),
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

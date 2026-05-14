import { z } from "zod"
import { strokeStyleSchema, boundElementSchema } from "./base-shape-schema"

export const arrowheadSchema = z.enum([
  "arrow", "bar", "circle", "circle_outline",
  "triangle", "triangle_outline", "diamond", "diamond_outline",
  "crowfoot_one", "crowfoot_many", "crowfoot_one_or_many",
])

export const pointBindingSchema = z.object({
  elementId: z.string(),
  focus: z.number().min(-1).max(1),
  gap: z.number().min(0),
})

export const arrowEndBindingSchema = z.union([
  z.object({ type: z.enum(["rectangle", "ellipse", "diamond"]), id: z.string().optional() }),
  z.object({ id: z.string(), type: z.enum(["rectangle", "ellipse", "diamond"]).optional() }),
])

export const arrowInputSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().min(1).max(4).optional(),
  strokeStyle: strokeStyleSchema.optional(),
  roughness: z.number().min(0).max(2).optional(),
  opacity: z.number().min(0).max(100).optional(),
  groupIds: z.array(z.string()).optional(),
  boundElements: z.array(boundElementSchema).nullable().optional(),
  startArrowhead: arrowheadSchema.nullable().optional(),
  endArrowhead: arrowheadSchema.nullable().optional(),
  elbowed: z.boolean().optional(),
  label: z.object({ text: z.string() }).optional(),
  start: arrowEndBindingSchema.optional(),
  end: arrowEndBindingSchema.optional(),
  startBinding: pointBindingSchema.nullable().optional(),
  endBinding: pointBindingSchema.nullable().optional(),
})

export type Arrowhead = z.infer<typeof arrowheadSchema>
export type PointBinding = z.infer<typeof pointBindingSchema>
export type ArrowEndBinding = z.infer<typeof arrowEndBindingSchema>
export type ArrowInput = z.infer<typeof arrowInputSchema>

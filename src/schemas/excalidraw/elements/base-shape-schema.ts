import { z } from "zod"

export const fillStyleSchema = z.enum(["solid", "hachure", "cross-hatch", "zigzag"])

export const strokeStyleSchema = z.enum(["solid", "dashed", "dotted"])

export const textAlignSchema = z.enum(["left", "center", "right"])

export const verticalAlignSchema = z.enum(["top", "middle", "bottom"])

export const boundElementSchema = z.object({
  id: z.string(),
  type: z.enum(["arrow", "text"]),
})

export const elementLabelSchema = z.object({
  text: z.string(),
  fontSize: z.number().optional(),
  fontFamily: z.number().optional(),
  strokeColor: z.string().optional(),
  textAlign: textAlignSchema.optional(),
  verticalAlign: verticalAlignSchema.optional(),
})

export const baseShapeSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  strokeColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fillStyle: fillStyleSchema.optional(),
  strokeWidth: z.number().min(1).max(4).optional(),
  strokeStyle: strokeStyleSchema.optional(),
  roughness: z.number().min(0).max(2).optional(),
  opacity: z.number().min(0).max(100).optional(),
  groupIds: z.array(z.string()).optional(),
  boundElements: z.array(boundElementSchema).nullable().optional(),
})

export type FillStyle = z.infer<typeof fillStyleSchema>
export type StrokeStyle = z.infer<typeof strokeStyleSchema>
export type TextAlign = z.infer<typeof textAlignSchema>
export type VerticalAlign = z.infer<typeof verticalAlignSchema>
export type BoundElement = z.infer<typeof boundElementSchema>
export type ElementLabel = z.infer<typeof elementLabelSchema>
export type BaseShape = z.infer<typeof baseShapeSchema>

export const COLORS = {
  primaryFill: "#dbeafe",
  primaryStroke: "#1e40af",
  successFill: "#dcfce7",
  successStroke: "#166534",
  warningFill: "#fef9c3",
  warningStroke: "#854d0e",
  errorFill: "#fee2e2",
  errorStroke: "#991b1b",
  externalFill: "#f3e8ff",
  externalStroke: "#6b21a8",
  processFill: "#e0f2fe",
  processStroke: "#0369a1",
  triggerFill: "#fed7aa",
  triggerStroke: "#c2410c",
  neutralFill: "#f1f5f9",
  neutralStroke: "#475569",
  textTitle: "#1e293b",
  textLabel: "#334155",
  textDescription: "#64748b",
  defaultStroke: "#1e1e1e",
  transparent: "transparent",
  white: "#ffffff",
} as const

export const DEFAULTS = {
  strokeColor: COLORS.defaultStroke,
  backgroundColor: COLORS.transparent,
  fillStyle: "solid" as FillStyle,
  strokeWidth: 2,
  strokeStyle: "solid" as StrokeStyle,
  roughness: 1,
  opacity: 100,
  textColor: COLORS.textLabel,
} as const

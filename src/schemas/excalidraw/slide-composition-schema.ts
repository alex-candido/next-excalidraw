import { z } from "zod"

export const slideTypeSchema = z.enum(["cover", "agenda", "content", "summary", "closing"])

export const representationSchema = z.enum([
  "auto",
  "flowchart",
  "mindmap",
  "orgchart",
  "sequence",
  "class",
  "er",
  "gantt",
  "timeline",
  "tree",
  "network",
  "architecture",
  "dataflow",
  "state",
  "swimlane",
  "fishbone",
  "pyramid",
  "venn",
  "matrix",
  "funnel",
  "infographic",
])

export const slideNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["rectangle", "ellipse", "diamond"]).default("rectangle"),
})

export const slideEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  style: z.enum(["solid", "dashed", "dotted"]).optional(),
})

export const slideCompositionParamsSchema = z.object({
  columns: z.number().int().positive().optional(),
  radius: z.number().positive().optional(),
  startX: z.number().optional(),
  startY: z.number().optional(),
  hGap: z.number().positive().optional(),
  vGap: z.number().positive().optional(),
})

export const slideStyleSchema = z.object({
  nodeFill: z.string().optional(),
  nodeStroke: z.string().optional(),
  edgeStroke: z.string().optional(),
  titleColor: z.string().optional(),
})

const columnSchema = z.object({
  title: z.string().optional(),
  items: z.array(z.string()).min(1),
})

// kind: "title_only" — capa, fechamento
const titleOnlySchema = z.object({
  type: slideTypeSchema,
  kind: z.literal("title_only"),
  title: z.string(),
  subtitle: z.string().optional(),
  style: slideStyleSchema.optional(),
})

// kind: "bullets" — agenda, sumário, conteúdo em lista
const bulletsSchema = z.object({
  type: slideTypeSchema,
  kind: z.literal("bullets"),
  title: z.string(),
  items: z.array(z.string()).min(1),
  style: slideStyleSchema.optional(),
})

// kind: "title_content" — conteúdo com diagrama
const titleContentSchema = z.object({
  type: slideTypeSchema,
  kind: z.literal("title_content"),
  title: z.string(),
  representation: representationSchema,
  nodes: z.array(slideNodeSchema).min(1),
  edges: z.array(slideEdgeSchema).default([]),
  params: slideCompositionParamsSchema.default({}),
  style: slideStyleSchema.optional(),
})

// kind: "two_column" — duas colunas
const twoColumnSchema = z.object({
  type: slideTypeSchema,
  kind: z.literal("two_column"),
  title: z.string(),
  left: columnSchema,
  right: columnSchema,
  style: slideStyleSchema.optional(),
})

// kind: "image_text" — imagem + texto
const imageTextSchema = z.object({
  type: slideTypeSchema,
  kind: z.literal("image_text"),
  title: z.string(),
  imagePrompt: z.string(),
  body: z.string(),
  style: slideStyleSchema.optional(),
})

// kind: "full_image" — imagem ocupa o slide inteiro
const fullImageSchema = z.object({
  type: slideTypeSchema,
  kind: z.literal("full_image"),
  imagePrompt: z.string(),
  style: slideStyleSchema.optional(),
})

// kind: "blank" — canvas vazio
const blankSchema = z.object({
  type: slideTypeSchema,
  kind: z.literal("blank"),
  style: slideStyleSchema.optional(),
})

export const slideCompositionSchema = z.discriminatedUnion("kind", [
  titleOnlySchema,
  bulletsSchema,
  titleContentSchema,
  twoColumnSchema,
  imageTextSchema,
  fullImageSchema,
  blankSchema,
])

export type SlideType = z.infer<typeof slideTypeSchema>
export type Representation = z.infer<typeof representationSchema>
export type SlideNode = z.infer<typeof slideNodeSchema>
export type SlideEdge = z.infer<typeof slideEdgeSchema>
export type SlideCompositionParams = z.infer<typeof slideCompositionParamsSchema>
export type SlideStyle = z.infer<typeof slideStyleSchema>
export type SlideComposition = z.infer<typeof slideCompositionSchema>

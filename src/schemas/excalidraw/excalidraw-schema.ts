import { z } from 'zod'

const FillStyleSchema = z.enum(['hachure', 'cross-hatch', 'solid', 'zigzag'])

const StrokeStyleSchema = z.enum(['solid', 'dashed', 'dotted'])

const TextAlignSchema = z.enum(['left', 'center', 'right'])

const VerticalAlignSchema = z.enum(['top', 'middle', 'bottom'])

// ValueOf<typeof ROUNDNESS> is a number constant, not a string enum
const RoundnessSchema = z.union([
  z.null(),
  z.object({
    type: z.number(),
    value: z.number().optional(),
  }),
])

// 'dot' is legacy but still valid; 'none' does not exist in the actual types
const ArrowheadSchema = z.enum([
  'arrow',
  'bar',
  'dot',
  'circle',
  'circle_outline',
  'triangle',
  'triangle_outline',
  'diamond',
  'diamond_outline',
  'crowfoot_one',
  'crowfoot_many',
  'crowfoot_one_or_many',
])

const BoundElementSchema = z.object({
  id: z.string(),
  type: z.enum(['arrow', 'text']),
})

const PointBindingSchema = z.object({
  elementId: z.string(),
  focus: z.number(),
  gap: z.number(),
}).nullable()

const ExcalidrawElementBaseSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  strokeColor: z.string(),
  backgroundColor: z.string(),
  fillStyle: FillStyleSchema,
  strokeWidth: z.number(),
  strokeStyle: StrokeStyleSchema,
  roundness: RoundnessSchema,
  roughness: z.number(),
  opacity: z.number(),
  width: z.number(),
  height: z.number(),
  angle: z.number(),
  seed: z.number(),
  version: z.number(),
  versionNonce: z.number(),
  index: z.string().nullable(),
  isDeleted: z.boolean(),
  groupIds: z.array(z.string()),
  frameId: z.string().nullable(),
  boundElements: z.array(BoundElementSchema).nullable(),
  updated: z.number(),
  link: z.string().nullable(),
  locked: z.boolean(),
  customData: z.record(z.string(), z.unknown()).optional(),
})

const ExcalidrawRectangleElementSchema = ExcalidrawElementBaseSchema.extend({
  type: z.literal('rectangle'),
})

const ExcalidrawEllipseElementSchema = ExcalidrawElementBaseSchema.extend({
  type: z.literal('ellipse'),
})

const ExcalidrawDiamondElementSchema = ExcalidrawElementBaseSchema.extend({
  type: z.literal('diamond'),
})

const ExcalidrawTextElementSchema = ExcalidrawElementBaseSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontSize: z.number(),
  fontFamily: z.number(),
  textAlign: TextAlignSchema,
  verticalAlign: VerticalAlignSchema,
  containerId: z.string().nullable(),
  originalText: z.string(),
  autoResize: z.boolean(),
  lineHeight: z.number(),
})

const ExcalidrawLineElementSchema = ExcalidrawElementBaseSchema.extend({
  type: z.literal('line'),
  points: z.array(z.tuple([z.number(), z.number()])),
  lastCommittedPoint: z.tuple([z.number(), z.number()]).nullable(),
  startBinding: PointBindingSchema,
  endBinding: PointBindingSchema,
  startArrowhead: ArrowheadSchema.nullable(),
  endArrowhead: ArrowheadSchema.nullable(),
  polygon: z.boolean(),
})

const ExcalidrawArrowElementSchema = ExcalidrawElementBaseSchema.extend({
  type: z.literal('arrow'),
  points: z.array(z.tuple([z.number(), z.number()])),
  lastCommittedPoint: z.tuple([z.number(), z.number()]).nullable(),
  startBinding: PointBindingSchema,
  endBinding: PointBindingSchema,
  startArrowhead: ArrowheadSchema.nullable(),
  endArrowhead: ArrowheadSchema.nullable(),
  elbowed: z.boolean(),
})

const ImageCropSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  naturalWidth: z.number(),
  naturalHeight: z.number(),
})

const ExcalidrawImageElementSchema = ExcalidrawElementBaseSchema.extend({
  type: z.literal('image'),
  fileId: z.string().nullable(),
  status: z.enum(['pending', 'saved', 'error']),
  scale: z.tuple([z.number(), z.number()]),
  crop: ImageCropSchema.nullable(),
})

const ExcalidrawFrameElementSchema = ExcalidrawElementBaseSchema.extend({
  type: z.literal('frame'),
  name: z.string().nullable(),
})

export const excalidrawElementSchema = z.discriminatedUnion('type', [
  ExcalidrawRectangleElementSchema,
  ExcalidrawEllipseElementSchema,
  ExcalidrawDiamondElementSchema,
  ExcalidrawTextElementSchema,
  ExcalidrawLineElementSchema,
  ExcalidrawArrowElementSchema,
  ExcalidrawImageElementSchema,
  ExcalidrawFrameElementSchema,
])

const appStateSchema = z
  .object({
    viewBackgroundColor: z.string().optional(),
    gridSize: z.number().nullable().optional(),
  })
  .passthrough()

const filesSchema = z.record(
  z.string(),
  z.object({
    mimeType: z.string(),
    id: z.string(),
    dataURL: z.string(),
    created: z.number(),
    lastRetrieved: z.number().optional(),
  }),
)

export const excalidrawFileSchema = z.object({
  type: z.literal('excalidraw'),
  version: z.number(),
  source: z.string().optional(),
  elements: z.array(excalidrawElementSchema),
  appState: appStateSchema,
  files: filesSchema.optional(),
})

export type ExcalidrawElement = z.infer<typeof excalidrawElementSchema>
export type ExcalidrawFile = z.infer<typeof excalidrawFileSchema>

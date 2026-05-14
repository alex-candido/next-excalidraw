import { z } from "zod"
import { baseShapeSchema, elementLabelSchema } from "./base-shape-schema"

export const diamondInputSchema = baseShapeSchema.extend({
  label: elementLabelSchema.optional(),
})

export type DiamondInput = z.infer<typeof diamondInputSchema>

import { z } from "zod"
import { baseShapeSchema, elementLabelSchema } from "./base-shape-schema"

export const ellipseInputSchema = baseShapeSchema.extend({
  label: elementLabelSchema.optional(),
})

export type EllipseInput = z.infer<typeof ellipseInputSchema>

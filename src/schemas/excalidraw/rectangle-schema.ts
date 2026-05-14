import { z } from "zod"
import { baseShapeSchema, elementLabelSchema } from "./base-shape-schema"

export const rectangleInputSchema = baseShapeSchema.extend({
  label: elementLabelSchema.optional(),
  rounded: z.boolean().optional(),
})

export type RectangleInput = z.infer<typeof rectangleInputSchema>

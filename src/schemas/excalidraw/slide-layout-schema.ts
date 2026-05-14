import { z } from "zod"

export const slideLayoutSchema = z.object({})

export type SlideLayout = z.infer<typeof slideLayoutSchema>

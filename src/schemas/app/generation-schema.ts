import { z } from "zod"

export function generationResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion("status", [
    z.object({ status: z.literal("completed"), data: dataSchema }),
    z.object({ status: z.literal("pending"), generationId: z.string().uuid() }),
  ])
}

// GET .../generations?type=slide|outline — contagem por status da tabela
// generation (1 linha por slide individual, 1 linha por lote de outline).
// Client usa isso pra saber quando parar de dar poll, em vez de comparar
// quantidade de slides carregados com quantidade esperada (não enxergava falha).
export const generationStatusSchema = z.object({
  total:     z.number().int(),
  completed: z.number().int(),
  failed:    z.number().int(),
  pending:   z.number().int(),
})

export type GenerationStatusSummary = z.infer<typeof generationStatusSchema>

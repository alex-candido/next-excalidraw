import { db } from "@/lib/drizzle"
import { generation } from "@/lib/drizzle/schema/generation"
import { and, eq } from "drizzle-orm"

export type GenerationInsert = typeof generation.$inferInsert
export type GenerationUpdate = Partial<Pick<GenerationInsert, "status" | "usage" | "model" | "completedAt">>

export function generationRepository() {
  async function create(data: GenerationInsert) {
    const [row] = await db.insert(generation).values(data).returning()
    return row
  }

  async function update(id: string, data: GenerationUpdate) {
    const [row] = await db
      .update(generation)
      .set(data)
      .where(eq(generation.id, id))
      .returning()
    return row
  }

  // slideService().generate() cria 1 linha por slide, multiOutlineService()
  // cria 1 por lote inteiro — aqui não importa a granularidade, só contamos
  // status (ver generation-service.ts, que soma completed/failed/pending).
  async function findByPresentationIdAndType(presentationId: string, type: number) {
    return db.query.generation.findMany({
      where: and(eq(generation.presentationId, presentationId), eq(generation.type, type)),
    })
  }

  return { create, update, findByPresentationIdAndType }
}

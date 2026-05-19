import { db } from "@/lib/drizzle"
import { generation } from "@/lib/drizzle/schema/generation"
import { eq } from "drizzle-orm"

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

  return { create, update }
}

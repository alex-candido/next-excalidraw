import { db, type DbClient } from "@/lib/drizzle"
import { outline } from "@/lib/drizzle/schema/outline"
import { eq, inArray } from "drizzle-orm"

export type OutlineInsert = typeof outline.$inferInsert
export type OutlineUpdate = Partial<Pick<OutlineInsert, "title" | "description" | "concepts" | "representation" | "layout">>

export function outlineRepository() {
  async function createMany(data: OutlineInsert[], client: DbClient = db) {
    return client.insert(outline).values(data).returning()
  }

  async function findByPresentationId(presentationId: string) {
    return db.query.outline.findMany({
      where: eq(outline.presentationId, presentationId),
      orderBy: (o, { asc }) => [asc(o.order)],
    })
  }

  async function update(id: string, data: OutlineUpdate) {
    const [row] = await db
      .update(outline)
      .set(data)
      .where(eq(outline.id, id))
      .returning()
    return row
  }

  async function findById(id: string) {
    return db.query.outline.findFirst({ where: eq(outline.id, id) }) ?? null
  }

  // Usado por "Regenerar tudo" — o outline é recriado do zero (pode mudar de
  // quantidade), não dá pra só atualizar as linhas existentes.
  async function deleteByPresentationId(presentationId: string, client: DbClient = db) {
    await client.delete(outline).where(eq(outline.presentationId, presentationId))
  }

  async function bulkUpdate(items: { id: string; title: string; description: string; concepts: string[]; representation: number; layout: string }[]) {
    let count = 0
    for (const item of items) {
      await db.update(outline).set({
        title:          item.title,
        description:    item.description,
        concepts:       item.concepts,
        representation: item.representation,
        layout:         item.layout,
      }).where(eq(outline.id, item.id))
      count++
    }
    return count
  }

  return { createMany, findById, findByPresentationId, update, bulkUpdate, deleteByPresentationId }
}

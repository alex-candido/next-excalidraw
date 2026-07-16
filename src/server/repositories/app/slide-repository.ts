import { db, type DbClient } from "@/lib/drizzle"
import { slide } from "@/lib/drizzle/schema/slide"
import { eq } from "drizzle-orm"

export type SlideInsert = typeof slide.$inferInsert
export type SlideUpdate = Partial<Pick<SlideInsert, "elements" | "appState">>

export function slideRepository() {
  async function create(data: SlideInsert) {
    const [row] = await db.insert(slide).values(data).returning()
    return row
  }

  async function createMany(data: SlideInsert[], client: DbClient = db) {
    return client.insert(slide).values(data).returning()
  }

  async function findById(id: string) {
    return db.query.slide.findFirst({ where: eq(slide.id, id) }) ?? null
  }

  async function findByPresentationId(presentationId: string) {
    return db.query.slide.findMany({
      where: eq(slide.presentationId, presentationId),
      orderBy: (s, { asc }) => [asc(s.order)],
    })
  }

  async function update(id: string, data: SlideUpdate) {
    const [row] = await db
      .update(slide)
      .set(data)
      .where(eq(slide.id, id))
      .returning()
    return row
  }

  async function updateThumbnail(id: string, thumbnail: string) {
    const [row] = await db
      .update(slide)
      .set({ thumbnail })
      .where(eq(slide.id, id))
      .returning()
    return row
  }

  async function bulkUpdate(items: { id: string; elements: unknown[]; appState: Record<string, unknown> }[]) {
    let count = 0
    for (const item of items) {
      await db.update(slide).set({ elements: item.elements, appState: item.appState }).where(eq(slide.id, item.id))
      count++
    }
    return count
  }

  return { create, createMany, findById, findByPresentationId, update, updateThumbnail, bulkUpdate }
}

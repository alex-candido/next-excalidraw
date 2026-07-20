import { db, type DbClient } from "@/lib/drizzle"
import { slide } from "@/lib/drizzle/schema/slide"
import { eq, inArray } from "drizzle-orm"

export type SlideInsert = typeof slide.$inferInsert
export type SlideUpdate = Partial<Pick<SlideInsert, "order" | "elements" | "appState" | "thumbnail">>

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

  // Usado por bulkUpdate pra resolver deletedIds (slide -> outlineId pareado)
  // antes de apagar — sempre escopado por presentationId, nunca confia em ids
  // crus vindos do client sem checar a quem pertencem.
  async function findManyByIds(ids: string[], presentationId: string) {
    if (ids.length === 0) return []
    return db.query.slide.findMany({
      where: (s, { and }) => and(inArray(s.id, ids), eq(s.presentationId, presentationId)),
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

  async function bulkUpdate(items: { id: string; order: number; elements: unknown[]; appState: Record<string, unknown>; thumbnail?: string }[]) {
    let count = 0
    for (const item of items) {
      const data: SlideUpdate = { order: item.order, elements: item.elements, appState: item.appState }
      // Item só manda thumbnail se o slide realmente mudou desde o último
      // cálculo (ver use-app-studio-save.ts) — sem essa chave não sobrescreve
      // a existente com undefined.
      if (item.thumbnail !== undefined) data.thumbnail = item.thumbnail
      await db.update(slide).set(data).where(eq(slide.id, item.id))
      count++
    }
    return count
  }

  return { create, createMany, findById, findByPresentationId, findManyByIds, update, updateThumbnail, bulkUpdate }
}

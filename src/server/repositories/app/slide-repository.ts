import { db, type DbClient } from "@/lib/drizzle"
import { slide } from "@/lib/drizzle/schema/slide"
import { eq } from "drizzle-orm"

export type SlideInsert = typeof slide.$inferInsert
export type SlideUpdate = Partial<Pick<SlideInsert, "elements" | "appState" | "thumbnail">>

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

  async function bulkUpdate(items: { id: string; elements: unknown[]; appState: Record<string, unknown>; thumbnail?: string }[]) {
    let count = 0
    for (const item of items) {
      const data: SlideUpdate = { elements: item.elements, appState: item.appState }
      // Só a capa manda thumbnail (o SVG calculado no mesmo save) — os demais
      // itens do lote não têm essa chave, então não sobrescreve com undefined.
      if (item.thumbnail !== undefined) data.thumbnail = item.thumbnail
      await db.update(slide).set(data).where(eq(slide.id, item.id))
      count++
    }
    return count
  }

  return { create, createMany, findById, findByPresentationId, update, updateThumbnail, bulkUpdate }
}

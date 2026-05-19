import { db } from "@/lib/drizzle"
import { slide } from "@/lib/drizzle/schema/slide"
import { eq } from "drizzle-orm"

export type SlideInsert = typeof slide.$inferInsert
export type SlideUpdate = Partial<Pick<SlideInsert, "elements" | "appState">>

export function slideRepository() {
  async function create(data: SlideInsert) {
    const [row] = await db.insert(slide).values(data).returning()
    return row
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

  return { create, findByPresentationId, update }
}

import { db } from "@/lib/drizzle"
import { presentation } from "@/lib/drizzle/schema/presentation"
import { eq } from "drizzle-orm"

export type PresentationInsert = typeof presentation.$inferInsert
export type PresentationUpdate = Partial<Pick<PresentationInsert, "title" | "status" | "slug">>

export function presentationRepository() {
  async function create(data: PresentationInsert) {
    const [row] = await db.insert(presentation).values(data).returning()
    return row
  }

  async function findById(id: string) {
    return db.query.presentation.findFirst({
      where: eq(presentation.id, id),
      with: { outlines: { orderBy: (o, { asc }) => [asc(o.order)] } },
    }) ?? null
  }

  async function findMany(userId: string) {
    return db.query.presentation.findMany({
      where: eq(presentation.userId, userId),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    })
  }

  async function update(id: string, data: PresentationUpdate) {
    const [row] = await db
      .update(presentation)
      .set(data)
      .where(eq(presentation.id, id))
      .returning()
    return row
  }

  return { create, findById, findMany, update }
}

import { db } from "@/lib/drizzle"
import { attachment } from "@/lib/drizzle/schema/attachment"
import { eq } from "drizzle-orm"

export type AttachmentInsert = typeof attachment.$inferInsert

export function attachmentRepository() {
  async function create(data: AttachmentInsert) {
    const [row] = await db.insert(attachment).values(data).returning()
    return row
  }

  async function findByPresentationId(presentationId: string) {
    return db.query.attachment.findMany({
      where: eq(attachment.presentationId, presentationId),
      orderBy: (a, { asc }) => [asc(a.createdAt)],
    })
  }

  async function deleteByPresentationId(presentationId: string) {
    await db.delete(attachment).where(eq(attachment.presentationId, presentationId))
  }

  return { create, findByPresentationId, deleteByPresentationId }
}

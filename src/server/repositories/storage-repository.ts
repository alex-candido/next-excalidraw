import { db } from "@/lib/drizzle"
import { storageBlob } from "@/lib/drizzle/schema/storage-blob"
import { storageAttachment } from "@/lib/drizzle/schema/storage-attachment"
import { and, eq, inArray } from "drizzle-orm"

export type StorageBlobInsert = typeof storageBlob.$inferInsert
export type StorageAttachmentInsert = typeof storageAttachment.$inferInsert

export function storageRepository() {
  async function findAttachment(recordType: number, recordId: string, name: string) {
    const row = await db.query.storageAttachment.findFirst({
      where: and(
        eq(storageAttachment.recordType, recordType),
        eq(storageAttachment.recordId, recordId),
        eq(storageAttachment.name, name),
      ),
      with: { blob: true },
    })
    return row ?? null
  }

  async function createBlob(data: StorageBlobInsert) {
    const [row] = await db.insert(storageBlob).values(data).returning()
    return row
  }

  async function updateBlob(id: string, data: Partial<Pick<StorageBlobInsert, "filename" | "mimeType" | "size" | "checksum">>) {
    const [row] = await db.update(storageBlob).set(data).where(eq(storageBlob.id, id)).returning()
    return row
  }

  async function createAttachment(data: StorageAttachmentInsert) {
    const [row] = await db.insert(storageAttachment).values(data).returning()
    return row
  }

  // Associação é polimórfica (record_id sem FK real) — usado antes de apagar o
  // dono de verdade (ex: slide/presentation), pra achar o que precisa ser
  // limpo no R2 e no banco antes que fique órfão.
  async function findAttachmentsByRecordIds(recordType: number, recordIds: string[]) {
    if (recordIds.length === 0) return []
    return db.query.storageAttachment.findMany({
      where: and(eq(storageAttachment.recordType, recordType), inArray(storageAttachment.recordId, recordIds)),
      with: { blob: true },
    })
  }

  async function deleteBlobs(ids: string[]) {
    if (ids.length === 0) return
    await db.delete(storageBlob).where(inArray(storageBlob.id, ids))
  }

  return { findAttachment, createBlob, updateBlob, createAttachment, findAttachmentsByRecordIds, deleteBlobs }
}

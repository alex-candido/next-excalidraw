import { createHash } from "crypto"
import { r2Client } from "@/lib/r2"
import { storageRepository } from "@/server/repositories/storage-repository"

interface UploadThumbnailInput {
  recordType: number
  recordId: string
  buffer: Buffer
  mimeType: string
}

export function storageService() {
  // Chave estável por (recordType, recordId) — regenerar sobrescreve o mesmo
  // objeto no R2 em vez de acumular blob órfão a cada save.
  async function upsertThumbnail(input: UploadThumbnailInput) {
    const key = `thumbnails/${input.recordType}-${input.recordId}.png`
    const url = await r2Client().putObject(key, input.buffer, input.mimeType)
    const checksum = createHash("sha256").update(input.buffer).digest("hex")

    const existing = await storageRepository().findAttachment(input.recordType, input.recordId, "thumbnail")

    if (existing) {
      await storageRepository().updateBlob(existing.blob.id, {
        mimeType: input.mimeType,
        size: input.buffer.byteLength,
        checksum,
      })
    } else {
      const blob = await storageRepository().createBlob({
        storageKey: key,
        filename: "thumbnail.png",
        mimeType: input.mimeType,
        size: input.buffer.byteLength,
        checksum,
      })
      await storageRepository().createAttachment({
        blobId: blob.id,
        recordType: input.recordType,
        recordId: input.recordId,
        name: "thumbnail",
      })
    }

    return url
  }

  // Chamado antes de apagar o dono de verdade (ex: slide/presentation) — sem
  // isso o blob/attachment (sem FK real, ver storage-repository.ts) e o
  // objeto no R2 ficam órfãos pra sempre. Best-effort no R2 (falha de rede não
  // pode travar a exclusão do dono, só custa storage residual); o banco é
  // limpo de qualquer jeito.
  async function deleteForRecords(recordType: number, recordIds: string[]) {
    const attachments = await storageRepository().findAttachmentsByRecordIds(recordType, recordIds)
    if (attachments.length === 0) return

    await Promise.all(attachments.map((a) =>
      r2Client().deleteObject(a.blob.storageKey).catch((err) => {
        console.warn(`[storage] falha ao apagar objeto R2 ${a.blob.storageKey}:`, err)
      }),
    ))

    await storageRepository().deleteBlobs(attachments.map((a) => a.blob.id))
  }

  return { upsertThumbnail, deleteForRecords }
}

import { attachment, AttachmentType } from "@/lib/drizzle/schema/attachment"
import { isSafeAttachmentUrl, validateAttachmentFile } from "@/lib/attachments/validate-file"
import { attachmentRepository } from "@/server/repositories/app/attachment-repository"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { MAX_ATTACHMENTS_PER_PRESENTATION } from "@/schemas/app/attachment-schema"

async function assertOwnership(presentationId: string, userId: string) {
  const presentation = await presentationRepository().findById(presentationId)
  if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
  if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })
  return presentation
}

// Contagem no servidor, não só no client — é a checagem que vale de verdade,
// mesmo que o form também limite isso na UI mais pra frente.
async function assertAttachmentLimit(presentationId: string) {
  const existing = await attachmentRepository().findByPresentationId(presentationId)
  if (existing.length >= MAX_ATTACHMENTS_PER_PRESENTATION) {
    throw Object.assign(
      new Error(`Limite de ${MAX_ATTACHMENTS_PER_PRESENTATION} anexos por apresentação atingido`),
      { status: 400 },
    )
  }
}

// Nunca devolve `content` (binário) pra API — o client não precisa disso, só o
// que já é exibido como chip (name/type/mimeType/size).
function toResult(row: typeof attachment.$inferSelect) {
  const { content: _content, ...result } = row
  return result
}

export function attachmentService() {
  async function createFile(
    presentationId: string,
    userId: string,
    kind: "image" | "file",
    name: string,
    buffer: Buffer,
  ) {
    await assertOwnership(presentationId, userId)
    await assertAttachmentLimit(presentationId)

    const { mimeType, size } = await validateAttachmentFile(buffer, kind)

    const row = await attachmentRepository().create({
      presentationId,
      type: kind === "image" ? AttachmentType.image : AttachmentType.file,
      name,
      content: buffer,
      mimeType,
      size,
    })
    return toResult(row)
  }

  async function createLink(presentationId: string, userId: string, name: string, url: string) {
    await assertOwnership(presentationId, userId)
    await assertAttachmentLimit(presentationId)

    if (!isSafeAttachmentUrl(url)) {
      throw Object.assign(new Error("URL inválida ou esquema não permitido"), { status: 400 })
    }

    const row = await attachmentRepository().create({
      presentationId,
      type: AttachmentType.link,
      name,
      url,
    })
    return toResult(row)
  }

  async function list(presentationId: string, userId: string) {
    await assertOwnership(presentationId, userId)
    const rows = await attachmentRepository().findByPresentationId(presentationId)
    return rows.map(toResult)
  }

  return { createFile, createLink, list }
}

import { extractAttachmentText } from "@/lib/attachments/extract-text"
import { AttachmentType } from "@/lib/drizzle/schema/attachment"
import { summarizeText } from "@/lib/gist"
import type { AttachmentContext } from "@/schemas/app/attachment-schema"

interface AttachmentRow {
  type: number
  name: string
  content: Buffer | null
  url: string | null
  mimeType: string | null
}

// Um PDF de 10MB podia extrair centenas de milhares de caracteres — resumido
// (extrativo, ver lib/gist/) pra ~6 frases antes de qualquer outra
// coisa, o que já reduz ~60-70% na prática (testado isoladamente). O corte
// abaixo é só um teto de segurança residual, não a estratégia principal.
const SUMMARY_SENTENCE_COUNT = 6
const MAX_ATTACHMENT_TEXT_LENGTH = 3_000

function finalizeText(text: string): string {
  const summarized = summarizeText(text, SUMMARY_SENTENCE_COUNT)
  if (summarized.length <= MAX_ATTACHMENT_TEXT_LENGTH) return summarized
  return `${summarized.slice(0, MAX_ATTACHMENT_TEXT_LENGTH)}\n[...conteúdo truncado, arquivo mais longo que o suportado...]`
}

// Roda uma vez, na service, antes de montar o input do workflow — assim o
// workflow nunca precisa saber como extrair texto de pdf/docx, só consome o
// resultado já pronto (base64 pra imagem, texto pra arquivo, URL crua pro link).
export async function buildAttachmentContext(rows: AttachmentRow[]): Promise<AttachmentContext[]> {
  const results: AttachmentContext[] = []

  for (const row of rows) {
    if (row.type === AttachmentType.image && row.content) {
      results.push({
        type: "image",
        name: row.name,
        mimeType: row.mimeType ?? undefined,
        base64: row.content.toString("base64"),
      })
      continue
    }

    if (row.type === AttachmentType.file && row.content) {
      // pdf-parse/mammoth podem falhar em arquivo corrompido ou malformado que
      // passou na checagem de magic bytes (essa só olha o cabeçalho, não o
      // arquivo inteiro) — um anexo ruim não pode derrubar a geração inteira.
      try {
        const text = await extractAttachmentText(row.content, row.mimeType ?? "")
        if (text?.trim()) results.push({ type: "file", name: row.name, text: finalizeText(text) })
      } catch (err) {
        console.warn(`[attachments] falha ao extrair texto de "${row.name}", ignorado`, err)
      }
      continue
    }

    if (row.type === AttachmentType.link && row.url) {
      results.push({ type: "link", name: row.name, url: row.url })
    }
  }

  return results
}

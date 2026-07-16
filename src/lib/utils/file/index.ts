import { fileTypeFromBuffer } from "file-type"
import { PDFParse } from "pdf-parse"
import * as mammoth from "mammoth"

// Utilitário genérico de arquivo — validação de assinatura binária, checagem
// de URL e extração de texto. Não é específico de attachments (único
// consumidor por ora), por isso vive em lib/utils/.
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const ALLOWED_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])
const ALLOWED_FILE_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx (não .doc — mammoth não lê o formato binário antigo)
  "text/plain",
  "text/markdown",
])

export interface ValidatedFile {
  mimeType: string
  size: number
}

function looksLikePlainText(buffer: Buffer): boolean {
  return !buffer.toString("utf-8").includes("�")
}

export function fileUtils() {
  // Nunca confiar em `File.type`/extensão declarados pelo client — isso é só
  // UX, contornável trivialmente. A validação real é a assinatura binária.
  async function validate(buffer: Buffer, kind: "image" | "file"): Promise<ValidatedFile> {
    if (buffer.byteLength === 0) {
      throw new Error("Arquivo vazio")
    }

    const maxSize = kind === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
    if (buffer.byteLength > maxSize) {
      throw new Error(`Arquivo excede o tamanho máximo permitido (${maxSize / (1024 * 1024)}MB)`)
    }

    const detected = await fileTypeFromBuffer(buffer)

    if (!detected) {
      if (kind === "file" && looksLikePlainText(buffer)) {
        return { mimeType: "text/plain", size: buffer.byteLength }
      }
      throw new Error("Não foi possível identificar o tipo real do arquivo")
    }

    const allowed = kind === "image" ? ALLOWED_IMAGE_MIME : ALLOWED_FILE_MIME
    if (!allowed.has(detected.mime)) {
      throw new Error(`Tipo de arquivo não permitido: ${detected.mime}`)
    }

    return { mimeType: detected.mime, size: buffer.byteLength }
  }

  // Sem busca de conteúdo no servidor por enquanto (decisão de produto: link de
  // attachment só entra como texto cru no prompt) — só validação de scheme. Se
  // um dia buscarmos conteúdo de link no servidor, isso vira insuficiente:
  // precisa resolver DNS e bloquear IP privado/loopback/link-local antes do
  // fetch (proteção de SSRF).
  function isSafeUrl(rawUrl: string): boolean {
    let parsed: URL
    try {
      parsed = new URL(rawUrl)
    } catch {
      return false
    }
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  }

  // Imagem não passa por aqui — entra multimodal direto no prompt do agent
  // (o Gemini já suporta isso nativamente). Link também não — vira texto cru.
  async function extractText(buffer: Buffer, mimeType: string): Promise<string | null> {
    if (mimeType === "text/plain" || mimeType === "text/markdown") {
      return buffer.toString("utf-8")
    }

    if (mimeType === "application/pdf") {
      const parser = new PDFParse({ data: buffer })
      try {
        const result = await parser.getText()
        return result.text
      } finally {
        await parser.destroy()
      }
    }

    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }

    return null
  }

  return { validate, isSafeUrl, extractText }
}

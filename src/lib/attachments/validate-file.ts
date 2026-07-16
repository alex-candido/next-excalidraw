import { fileTypeFromBuffer } from "file-type"

// Material de referência pra ajudar a IA a gerar a apresentation — não é storage
// de arquivo grande, por isso os limites são conservadores. Imagem é mais
// restrita que arquivo: vira base64 (+33%) e entra direto na requisição pro
// modelo (multimodal), não é só lida/extraída como o texto de um arquivo.
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const ALLOWED_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"])
const ALLOWED_FILE_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx (não .doc — mammoth não lê o formato binário antigo)
  "text/plain",
  "text/markdown",
])

export interface ValidatedAttachmentFile {
  mimeType: string
  size: number
}

// .txt/.md são texto puro, sem assinatura binária — file-type não detecta esses
// (retorna undefined). Nesse caso, valida que o conteúdo decodifica como UTF-8
// sem caractere de substituição, em vez de confiar no nome/extensão do arquivo.
function looksLikePlainText(buffer: Buffer): boolean {
  return !buffer.toString("utf-8").includes("�")
}

// Nunca confiar em `File.type`/extensão declarados pelo client — isso é só UX,
// contornável trivialmente. A validação real é a assinatura binária do conteúdo.
export async function validateAttachmentFile(
  buffer: Buffer,
  kind: "image" | "file",
): Promise<ValidatedAttachmentFile> {
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

// Sem busca de conteúdo no servidor por enquanto (decisão: link só entra como
// texto cru no prompt) — só validação de scheme. Se um dia buscarmos o conteúdo
// do link no servidor, isso vira insuficiente: precisa resolver o DNS e bloquear
// IP privado/loopback/link-local antes de qualquer fetch (proteção de SSRF).
export function isSafeAttachmentUrl(rawUrl: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return false
  }
  return parsed.protocol === "http:" || parsed.protocol === "https:"
}

import { PDFParse } from "pdf-parse"
import * as mammoth from "mammoth"

// Imagem não passa por aqui — entra multimodal direto no prompt do agent
// (o Gemini já suporta isso nativamente). Link também não — vira texto cru.
// Isso é só pra extrair texto de arquivo (pdf/docx/txt/md) antes de injetar no
// prompt, já que esses formatos não são nativamente visuais.
export async function extractAttachmentText(buffer: Buffer, mimeType: string): Promise<string | null> {
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

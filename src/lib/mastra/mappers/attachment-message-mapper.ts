import type { AttachmentContext } from "@/schemas/app/attachment-schema"

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image"; image: string; mimeType?: string }

// Imagem entra multimodal de verdade (o Gemini já suporta) — arquivo/link viram
// texto adicional no fim do prompt, já pré-processados (texto extraído de
// pdf/docx, URL crua de link) antes de chegar aqui pela service.
export function attachmentMessageMapper() {
  function buildContent(baseText: string, attachments: AttachmentContext[] = []): string | ContentPart[] {
    if (attachments.length === 0) return baseText

    const parts: string[] = [baseText]

    const files = attachments.filter((a) => a.type === "file" && a.text)
    if (files.length) {
      parts.push("Material de referência anexado (arquivo):")
      for (const f of files) parts.push(`[${f.name}]\n${f.text}`)
    }

    const links = attachments.filter((a) => a.type === "link" && a.url)
    if (links.length) {
      parts.push(`Links de referência anexados: ${links.map((l) => `${l.name} (${l.url})`).join(", ")}`)
    }

    const images = attachments.filter((a) => a.type === "image" && a.base64)
    if (images.length === 0) return parts.join("\n")

    const content: ContentPart[] = [{ type: "text", text: parts.join("\n") }]
    for (const img of images) {
      content.push({ type: "image", image: img.base64 as string, mimeType: img.mimeType })
    }
    return content
  }

  return { buildContent }
}

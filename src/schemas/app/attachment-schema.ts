import { z } from "zod"

// Compartilhado entre client (guarda instantânea na UI) e server (a checagem
// que vale de verdade, em attachment-service.ts) — fica aqui por ser o módulo
// mais leve, sem import server-only, que os dois lados já importam.
export const MAX_ATTACHMENTS_PER_PRESENTATION = 5

export const attachmentSchema = z.object({
  id: z.string().uuid(),
  presentationId: z.string().uuid(),
  type: z.number().int(),
  name: z.string(),
  url: z.string().nullable(),
  mimeType: z.string().nullable(),
  size: z.number().int().nullable(),
  createdAt: z.string(),
})

export type Attachment = z.infer<typeof attachmentSchema>

export const attachmentCreateLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
})

export type AttachmentCreateLink = z.infer<typeof attachmentCreateLinkSchema>

export const attachmentListSchema = z.object({
  attachments: z.array(attachmentSchema),
})

// Anexo já pré-processado pra virar contexto de geração — imagem em base64
// (multimodal direto, o Gemini já suporta), arquivo com texto já extraído
// (pdf/docx/txt/md — não é nativamente visual), link como URL crua (sem fetch
// de conteúdo por enquanto, ver pm/decisions.md).
export const attachmentContextSchema = z.object({
  type: z.enum(["image", "file", "link"]),
  name: z.string(),
  mimeType: z.string().optional(),
  base64: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
})

export type AttachmentContext = z.infer<typeof attachmentContextSchema>

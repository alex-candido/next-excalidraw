import { NextRequest } from "next/server"
import { attachmentCreateLinkSchema } from "@/schemas/app/attachment-schema"
import { attachmentService } from "@/server/services/app/attachment-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const attachments = await attachmentService().list(id, DEV_USER_ID)
    return Response.json({ attachments }, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

// Imagem/arquivo chegam via multipart/form-data (campo "file" + "kind"), link via JSON.
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const contentType = req.headers.get("content-type") ?? ""

  try {
    if (contentType.includes("application/json")) {
      const body = await req.json()
      const parsed = attachmentCreateLinkSchema.safeParse(body)
      if (!parsed.success) {
        return Response.json({ error: parsed.error.flatten() }, { status: 400 })
      }

      const created = await attachmentService().createLink(id, DEV_USER_ID, parsed.data.name, parsed.data.url)
      return Response.json(created, { status: 201 })
    }

    const form = await req.formData()
    const file = form.get("file")
    const kind = form.get("kind")

    if (!(file instanceof File) || (kind !== "image" && kind !== "file")) {
      return Response.json({ error: "Campos 'file'/'kind' inválidos" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const created = await attachmentService().createFile(id, DEV_USER_ID, kind, file.name, buffer)
    return Response.json(created, { status: 201 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

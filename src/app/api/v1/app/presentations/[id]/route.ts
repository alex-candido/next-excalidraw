import { NextRequest } from "next/server"
import { presentationRenameSchema } from "@/schemas/app/presentation-schema"
import { presentationService } from "@/server/services/app/presentation-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body   = await req.json()
  const parsed = presentationRenameSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const presentation = await presentationService().rename(id, DEV_USER_ID, parsed.data.title)
    return Response.json({ id: presentation.id, title: presentation.title }, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    const presentation = await presentationService().findById(id, DEV_USER_ID)
    return Response.json(presentation, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    await presentationService().moveToTrash(id, DEV_USER_ID)
    return new Response(null, { status: 204 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

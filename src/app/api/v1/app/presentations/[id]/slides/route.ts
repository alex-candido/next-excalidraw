import { NextRequest } from "next/server"
import { slideBulkUpdateSchema } from "@/schemas/app/slide-schema"
import { slideRepository } from "@/server/repositories/app/slide-repository"
import { slideService } from "@/server/services/app/slide-service"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const presentation = await presentationRepository().findById(id)

  if (!presentation) return Response.json({ error: "Not found" }, { status: 404 })
  if (presentation.userId !== DEV_USER_ID) return Response.json({ error: "Forbidden" }, { status: 403 })

  const slides = await slideRepository().findByPresentationId(id)
  return Response.json({ slides }, { status: 200 })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body   = await req.json()
  const parsed = slideBulkUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await slideService().bulkUpdate(id, DEV_USER_ID, parsed.data)
    return Response.json(result, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

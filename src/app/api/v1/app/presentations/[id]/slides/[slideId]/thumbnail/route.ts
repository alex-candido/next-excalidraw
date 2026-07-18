import { NextRequest } from "next/server"
import { slideThumbnailUpdateSchema } from "@/schemas/app/slide-schema"
import { slideService } from "@/server/services/app/slide-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string; slideId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id, slideId } = await params
  const body   = await req.json()
  const parsed = slideThumbnailUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const slide = await slideService().setThumbnail(id, slideId, DEV_USER_ID, parsed.data.thumbnail)
    return Response.json({ thumbnail: slide.thumbnail }, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

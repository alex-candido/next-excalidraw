import { NextRequest } from "next/server"
import { slideService } from "@/server/services/app/slide-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string; slideId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id, slideId } = await params

  const formData = await req.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return Response.json({ error: "Campo 'file' ausente ou inválido" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const slide  = await slideService().generateThumbnail(id, slideId, DEV_USER_ID, buffer)
    return Response.json({ thumbnail: slide.thumbnail }, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

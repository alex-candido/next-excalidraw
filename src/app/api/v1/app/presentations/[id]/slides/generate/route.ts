import { NextRequest } from "next/server"
import { slideGenerateSchema } from "@/schemas/app/slide-schema"
import { slideService } from "@/server/services/app/slide-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body   = await req.json()
  const parsed = slideGenerateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await slideService().generate(id, DEV_USER_ID, parsed.data)
    return Response.json(result, { status: 201 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

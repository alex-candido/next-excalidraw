import { NextRequest } from "next/server"
import { presentationService } from "@/server/services/app/presentation-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params

  try {
    await presentationService().restore(id, DEV_USER_ID)
    return new Response(null, { status: 204 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

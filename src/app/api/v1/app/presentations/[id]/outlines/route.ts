import { NextRequest } from "next/server"
import { outlineBulkUpdateSchema } from "@/schemas/app/presentations/multi-schema"
import { multiOutlineService } from "@/server/services/app/multi-outline-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body   = await req.json()
  const parsed = outlineBulkUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await multiOutlineService().bulkUpdate(id, DEV_USER_ID, parsed.data)
    return Response.json(result, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

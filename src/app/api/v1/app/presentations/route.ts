import { NextRequest } from "next/server"
import { presentationCreateSchema, presentationListQuerySchema } from "@/schemas/app/presentation-schema"
import { presentationService } from "@/server/services/app/presentation-service"
import { PresentationVisibility } from "@/lib/drizzle/schema/presentation"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

export async function GET(req: NextRequest) {
  const parsed = presentationListQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { tab, visibility, q, cursor, limit } = parsed.data

  const result = await presentationService().list(DEV_USER_ID, {
    tab,
    visibility: visibility ? PresentationVisibility[visibility] : undefined,
    search: q,
    cursor,
    limit,
  })

  return Response.json(result, { status: 200 })
}

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = presentationCreateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const result = await presentationService().create(DEV_USER_ID, parsed.data)
  return Response.json(result, { status: 201 })
}

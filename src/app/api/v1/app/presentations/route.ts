import { NextRequest } from "next/server"
import { presentationCreateSchema } from "@/schemas/app/presentation-schema"
import { presentationService } from "@/server/services/app/presentation-service"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

export async function GET(_req: NextRequest) {
  const presentations = await presentationRepository().findMany(DEV_USER_ID)
  return Response.json({ presentations }, { status: 200 })
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

import { NextRequest } from "next/server"
import { slideRepository } from "@/server/repositories/app/slide-repository"
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

export async function PATCH(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 200 })
}

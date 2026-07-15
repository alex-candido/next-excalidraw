import { NextRequest } from "next/server"
import { presentationGenerateSchema } from "@/schemas/app/presentation-schema"
import { GenerationType, GenerationStatus } from "@/lib/drizzle/schema/generation"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { inngest } from "@/lib/inngest/client"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body   = await req.json()
  const parsed = presentationGenerateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const presentation = await presentationRepository().findById(id)
  if (!presentation) {
    return Response.json({ error: "Presentation not found" }, { status: 404 })
  }
  if (presentation.userId !== DEV_USER_ID) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const generation = await generationRepository().create({
    presentationId: id,
    type:           GenerationType.outline,
    status:         GenerationStatus.pending,
  })

  await inngest.send({
    name: "presentation/outline.generate.requested",
    data: {
      presentationId:   id,
      generationId:     generation.id,
      userId:           DEV_USER_ID,
      presentationType: presentation.type,
      input:            parsed.data,
    },
  })

  return Response.json({ status: "pending", generationId: generation.id }, { status: 202 })
}

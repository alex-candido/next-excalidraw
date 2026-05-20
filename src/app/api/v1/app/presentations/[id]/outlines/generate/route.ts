import { NextRequest } from "next/server"
import { presentationGenerateSchema } from "@/schemas/app/presentation-schema"
import { PresentationType } from "@/lib/drizzle/schema/presentation"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { multiOutlineService } from "@/server/services/app/multi-outline-service"
import { singleOutlineService } from "@/server/services/app/single-outline-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body   = await req.json()
  const parsed = presentationGenerateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const presentation = await presentationRepository().findById(id)
    if (!presentation) {
      return Response.json({ error: "Presentation not found" }, { status: 404 })
    }

    if (presentation.type === PresentationType.single) {
      const result = await singleOutlineService().generate(id, DEV_USER_ID, {
        userPrompt: parsed.data.userPrompt,
        language:   parsed.data.language,
      })
      return Response.json(result, { status: 201 })
    }

    const result = await multiOutlineService().generate(id, DEV_USER_ID, {
      userPrompt: parsed.data.userPrompt,
      language:   parsed.data.language,
      slideCount: parsed.data.slideCount,
      keywords:   parsed.data.keywords,
    })
    return Response.json(result, { status: 201 })
  } catch (err: unknown) {
    const status  = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

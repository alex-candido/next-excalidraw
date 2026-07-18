import { NextRequest } from "next/server"
import { outlineRegenerateAllSchema } from "@/schemas/app/presentations/multi-schema"
import { GenerationType, GenerationStatus } from "@/lib/drizzle/schema/generation"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { multiOutlineService } from "@/server/services/app/multi-outline-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

// Síncrona, igual o regenerar individual (1 chamada só ao workflow, não N) —
// diferente da geração inicial (assíncrona via Inngest), que não tem essa
// garantia de ser 1 chamada rápida (attachments, presentation ainda em draft).
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body   = await req.json()
  const parsed = outlineRegenerateAllSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const generation = await generationRepository().create({
    presentationId: id,
    type:           GenerationType.outline,
    status:         GenerationStatus.pending,
  })

  try {
    const result = await multiOutlineService().regenerateAll(id, generation.id, DEV_USER_ID, parsed.data)
    return Response.json(result, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

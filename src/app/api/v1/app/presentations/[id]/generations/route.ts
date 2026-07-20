import { NextRequest } from "next/server"
import { GenerationType } from "@/lib/drizzle/schema/generation"
import { generationService } from "@/server/services/app/generation-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

type Params = { params: Promise<{ id: string }> }

// ?type=slide|outline (default slide) — contagem por status da tabela
// generation, pra saber se a geração terminou (e se alguma falhou) sem
// precisar comparar quantidade de slides carregados com quantidade esperada.
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const typeParam = req.nextUrl.searchParams.get("type")
  const type = typeParam === "outline" ? GenerationType.outline : GenerationType.slide

  try {
    const result = await generationService().status(id, DEV_USER_ID, type)
    return Response.json(result, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

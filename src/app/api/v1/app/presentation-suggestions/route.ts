import { NextRequest } from "next/server"
import { presentationEntrySuggestionListSchema } from "@/schemas/app/presentation-entry-schema"
import { presentationEntryService } from "@/server/services/app/presentation-entry-service"

// Sem verificação de usuário — conteúdo curado (kind=suggestion) é o mesmo pra
// todo mundo, não depende de quem está logado.
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const exclude = url.searchParams.get("exclude")

  // Number(null) === 0 — sem o `.has()`, um param ausente virava silenciosamente
  // type=0/language=0 válido em vez de falhar a validação.
  const parsed = presentationEntrySuggestionListSchema.safeParse({
    type: url.searchParams.has("type") ? Number(url.searchParams.get("type")) : NaN,
    language: url.searchParams.has("language") ? Number(url.searchParams.get("language")) : NaN,
    limit: url.searchParams.has("limit") ? Number(url.searchParams.get("limit")) : undefined,
    exclude: exclude ? exclude.split(",").filter(Boolean) : undefined,
  })

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const suggestions = await presentationEntryService().listSuggestions(parsed.data)
    return Response.json({ suggestions }, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

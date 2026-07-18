import { presentationService } from "@/server/services/app/presentation-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

export async function POST() {
  try {
    const count = await presentationService().restoreAll(DEV_USER_ID)
    return Response.json({ count }, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

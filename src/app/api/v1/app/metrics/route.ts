import { NextRequest } from "next/server"
import { metricsService } from "@/server/services/app/metrics-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

export async function GET(_req: NextRequest) {
  try {
    const metrics = await metricsService().get(DEV_USER_ID)
    return Response.json(metrics, { status: 200 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status })
  }
}

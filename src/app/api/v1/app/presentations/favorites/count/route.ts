import { presentationService } from "@/server/services/app/presentation-service"

const DEV_USER_ID = "00000001-0000-4000-8000-000000000001"

export async function GET() {
  const count = await presentationService().favoritesCount(DEV_USER_ID)
  return Response.json({ count }, { status: 200 })
}

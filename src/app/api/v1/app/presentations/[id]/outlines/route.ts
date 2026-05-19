import { NextRequest } from "next/server";

// PATCH /api/v1/app/presentations/[id]/outlines — bulk update outlines
export async function PATCH(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 200 });
}

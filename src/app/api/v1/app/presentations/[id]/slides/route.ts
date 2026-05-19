import { NextRequest } from "next/server";

// GET /api/v1/app/presentations/[id]/slides — list slides
export async function GET(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 200 });
}

// PATCH /api/v1/app/presentations/[id]/slides — bulk save slides from editor
export async function PATCH(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 200 });
}

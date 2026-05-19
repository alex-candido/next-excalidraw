import { NextRequest } from "next/server";

// POST /api/v1/app/presentations/[id]/outlines/generate — generate outlines
export async function POST(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 201 });
}

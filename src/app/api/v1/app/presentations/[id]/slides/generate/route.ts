import { NextRequest } from "next/server";

// POST /api/v1/app/presentations/[id]/slides/generate — generate slides from outlines
export async function POST(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 201 });
}

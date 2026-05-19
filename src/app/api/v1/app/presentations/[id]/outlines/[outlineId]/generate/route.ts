import { NextRequest } from "next/server";

// POST /api/v1/app/presentations/[id]/outlines/[outlineId]/generate — regenerate single outline
export async function POST(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 200 });
}

import { NextRequest } from "next/server";

// POST /api/v1/app/presentations/[id]/slides/[slideId]/generate — regenerate single slide
export async function POST(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 200 });
}

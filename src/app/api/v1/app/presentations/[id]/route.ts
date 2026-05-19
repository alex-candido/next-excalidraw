import { NextRequest } from "next/server";

// GET /api/v1/app/presentations/[id] — get presentation detail
export async function GET(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 200 });
}

// DELETE /api/v1/app/presentations/[id] — delete presentation
export async function DELETE(_req: NextRequest) {
  return new Response(null, { status: 204 });
}

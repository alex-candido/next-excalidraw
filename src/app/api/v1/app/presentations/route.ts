import { NextRequest } from "next/server";

// GET /api/v1/app/presentations — list user presentations
export async function GET(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 200 });
}

// POST /api/v1/app/presentations — create presentation + generate outline
export async function POST(_req: NextRequest) {
  return Response.json({ message: "TODO" }, { status: 201 });
}

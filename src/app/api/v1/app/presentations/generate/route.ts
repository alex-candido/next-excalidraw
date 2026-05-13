import { mastra } from "@/lib/mastra";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  if (!topic) {
    return Response.json({ error: "topic é obrigatório" }, { status: 400 });
  }

  const workflow = mastra.getWorkflow("outlineWorkflow");
  const run = await workflow.createRun();
  const result = await run.start({ inputData: { topic } });

  return Response.json(result);
}

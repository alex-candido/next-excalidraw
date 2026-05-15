import { mastra } from "@/lib/mastra";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userPrompt } = await req.json();

  if (!userPrompt) {
    return Response.json({ error: "userPrompt é obrigatório" }, { status: 400 });
  }

  const workflow = mastra.getWorkflow("outlineWorkflow");
  const run = await workflow.createRun();
  const result = await run.start({ inputData: { userPrompt } });

  return Response.json(result);
}

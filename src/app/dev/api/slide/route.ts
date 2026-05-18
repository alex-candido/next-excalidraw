import { mastra } from "@/lib/mastra"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { outlineId, order, type, title, description, concepts, representation, layout, language = 0, aspectRatio = 0 } = body

  if (!title || !description || type === undefined || representation === undefined) {
    return Response.json({ error: "title, description, type and representation are required" }, { status: 400 })
  }

  const workflow = mastra.getWorkflow("slideWorkflow")
  const run = await workflow.createRun()
  const result = await run.start({
    inputData: {
      outlineId: outlineId ?? "sandbox",
      order: order ?? 1,
      type,
      title,
      description,
      concepts: concepts ?? [],
      representation,
      layout:      layout ?? "",
      language,
      aspectRatio,
    },
  })

  return Response.json(result)
}

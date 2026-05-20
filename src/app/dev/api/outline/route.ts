import { mastra } from "@/lib/mastra"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userPrompt, language = 0, slideCount = 0, keywords = [] } = body

  if (!userPrompt) {
    return Response.json({ error: "userPrompt is required" }, { status: 400 })
  }

  const workflow = mastra.getWorkflow("multiOutlineWorkflow")
  const run = await workflow.createRun()
  const result = await run.start({ inputData: { userPrompt, language, slideCount, keywords } })

  return Response.json(result)
}

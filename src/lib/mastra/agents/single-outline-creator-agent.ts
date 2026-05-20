import { Agent } from "@mastra/core/agent"
import singleOutlineCreatorPrompt from "../prompts/single-outline-creator-prompt"
import { outlineStructureTool } from "../tools/outline-structure-tool"

export const singleOutlineCreatorAgent = new Agent({
  id:           "single-outline-creator-agent",
  name:         "single-outline-creator-agent",
  instructions: singleOutlineCreatorPrompt,
  model: {
    id:     `google/${process.env.GOOGLE_GENERATIVE_AI_MODEL}`,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  },
  tools: { outlineStructureTool },
})

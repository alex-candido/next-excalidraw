import { Agent } from "@mastra/core/agent"
import multiOutlineCreatorPrompt from "../prompts/multi-outline-creator-prompt"
import { outlineStructureTool } from "../tools/outline-structure-tool"

export const multiOutlineCreatorAgent = new Agent({
  id:           "multi-outline-creator-agent",
  name:         "multi-outline-creator-agent",
  instructions: multiOutlineCreatorPrompt,
  model: {
    id:     `google/${process.env.GOOGLE_GENERATIVE_AI_MODEL}`,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  },
  tools: { outlineStructureTool },
})

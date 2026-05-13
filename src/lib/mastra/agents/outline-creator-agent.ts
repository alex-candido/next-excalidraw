import { Agent } from "@mastra/core/agent";
import outlineCreatorPrompt from "../prompts/outline-creator-prompt";
import { outlineStructureTool } from "../tools/outline-structure-tool";

export const outlineCreatorAgent = new Agent({
  id: "outline-creator-agent",
  name: "outline-creator-agent",
  instructions: outlineCreatorPrompt,
  model: {
    id: `google/${process.env.GOOGLE_GENERATIVE_AI_MODEL}`,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  },
  tools: { outlineStructureTool },
});

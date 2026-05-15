import { Agent } from "@mastra/core/agent";
import { slideStructureTool } from "../tools/slide-structure-tool";

export const slideCreatorAgent = new Agent({
  id: "slide-creator-agent",
  name: "slide-creator-agent",
  instructions: "",
  model: {
    id: `google/${process.env.GOOGLE_GENERATIVE_AI_MODEL}`,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  },
  tools: { slideStructureTool },
});

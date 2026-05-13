import { createScorer } from "@mastra/core/evals";
import outlineSemanticScorerPrompt from "../prompts/outline-semantic-scorer-prompt";

export const outlineSemanticScorer = createScorer({
  id: "outline-semantic-scorer",
  name: "Outline Semantic Scorer",
  description: "Avalia a coerência semântica entre o tema solicitado e o outline gerado",
  type: "agent",
  judge: {
    model: {
      id: `google/${process.env.GOOGLE_GENERATIVE_AI_MODEL}`,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    instructions: outlineSemanticScorerPrompt,
  },
});

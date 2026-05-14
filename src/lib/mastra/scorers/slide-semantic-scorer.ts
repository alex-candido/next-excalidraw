import { createScorer } from "@mastra/core/evals";
import slideSemanticScorerPrompt from "../prompts/slide-semantic-scorer-prompt";

export const slideSemanticScorer = createScorer({
  id: "slide-semantic-scorer",
  name: "Slide Semantic Scorer",
  description: "Avalia a coerência semântica entre o outline fornecido e o conteúdo do slide gerado",
  type: "agent",
  judge: {
    model: {
      id: `google/${process.env.GOOGLE_GENERATIVE_AI_MODEL}`,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    instructions: slideSemanticScorerPrompt,
  },
});

import { createScorer } from "@mastra/core/scores";

export const outlineQualityScorer = createScorer({
  name: "Outline Quality",
  description: "Avalia se o outline gerado tem título claro e conteúdo relevante ao tema",
  type: "agent",
  judge: {
    model: {
      id: "google/gemini-2.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
    },
    instructions: `Você avalia a qualidade de outlines de apresentações.
Analise se o outline tem:
- Um título claro e relacionado ao tema
- Um conteúdo descritivo e relevante

Retorne uma pontuação de 0 a 1 e uma justificativa curta.`,
  },
});

export const outlineScorers = {
  outlineQualityScorer,
};

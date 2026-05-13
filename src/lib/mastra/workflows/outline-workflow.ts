import { createStep, createWorkflow } from "@mastra/core/workflows";
import { outlineSemanticScorer } from "../scorers/outline-semantic-scorer";
import { z } from "zod";

const outlineSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const generateOutlineStep = createStep({
  id: "generate-outline",
  inputSchema: z.object({ topic: z.string().min(1) }),
  outputSchema: outlineSchema,
  scorers: { outlineSemanticScorer: { scorer: outlineSemanticScorer } },
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("outlineCreatorAgent");
    const response = await agent.stream([
      {
        role: "user",
        content: `Crie um outline de apresentação para o tema: ${inputData.topic}`,
      },
    ]);
    const toolResults = await response.toolResults;
    const toolResult = toolResults[0];
    return toolResult.payload.result as z.infer<typeof outlineSchema>;
  },
});

export const outlineWorkflow = createWorkflow({
  id: "outline-workflow",
  inputSchema: z.object({ topic: z.string().min(1) }),
  outputSchema: outlineSchema,
}).then(generateOutlineStep);

outlineWorkflow.commit();

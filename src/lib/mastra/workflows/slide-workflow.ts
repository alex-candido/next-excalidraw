import { createStep, createWorkflow } from "@mastra/core/workflows";
import { slideSemanticScorer } from "../scorers/slide-semantic-scorer";
import { z } from "zod";

const slideContentSchema = z.object({
  title:   z.string(),
  body:    z.string(),
  bullets: z.array(z.string()),
});

const generateSlideStep = createStep({
  id: "generate-slide",
  inputSchema: z.object({
    title:       z.string().min(1),
    description: z.string(),
    type:        z.enum(["cover", "agenda", "content", "summary", "closing"]),
  }),
  outputSchema: slideContentSchema,
  scorers: { slideSemanticScorer: { scorer: slideSemanticScorer } },
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("slideCreatorAgent");
    const response = await agent.stream([
      {
        role: "user",
        content: `Tipo: ${inputData.type}\nTítulo: ${inputData.title}\nDescrição: ${inputData.description}`,
      },
    ]);
    const toolResults = await response.toolResults;
    const toolResult = toolResults[0];
    return toolResult.payload.result as z.infer<typeof slideContentSchema>;
  },
});

export const slideWorkflow = createWorkflow({
  id: "slide-workflow",
  inputSchema: z.object({
    title:       z.string().min(1),
    description: z.string(),
    type:        z.enum(["cover", "agenda", "content", "summary", "closing"]),
  }),
  outputSchema: slideContentSchema,
}).then(generateSlideStep);

slideWorkflow.commit();

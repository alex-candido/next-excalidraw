import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const outlineSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const generateOutlineStep = createStep({
  id: "generate-outline",
  inputSchema: z.object({ topic: z.string() }),
  outputSchema: outlineSchema,
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("outline-agent");
    const result = await agent.generate(
      `Crie um outline de apresentação para o tema: ${inputData.topic}`
    );
    const parsed = JSON.parse(result.text);
    return { title: parsed.title, content: parsed.content };
  },
});

export const outlineWorkflow = createWorkflow({
  id: "outline-workflow",
  inputSchema: z.object({ topic: z.string() }),
  outputSchema: outlineSchema,
}).then(generateOutlineStep);

outlineWorkflow.commit();

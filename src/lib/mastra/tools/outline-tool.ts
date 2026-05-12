import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const outlineTool = createTool({
  id: "create_outlines",
  description: "Gera um outline de apresentação com título e conteúdo a partir de um tema",
  inputSchema: z.object({
    topic: z.string().describe("Tema da apresentação"),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      title: context.topic,
      content: "",
    };
  },
});

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const outlineStructureTool = createTool({
  id: "outline-structure-tool",
  description: "Estrutura e valida o outline gerado, garantindo título e conteúdo bem definidos",
  inputSchema: z.object({
    title: z.string().describe("Título da apresentação"),
    content: z.string().describe("Descrição geral do conteúdo da apresentação"),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
  }),
  execute: async (inputData) => {
    return {
      title: inputData.title.trim(),
      content: inputData.content.trim(),
    };
  },
});

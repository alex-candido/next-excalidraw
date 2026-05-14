import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const slideStructureTool = createTool({
  id: "slide-structure-tool",
  description: "Estrutura o conteúdo do slide, garantindo título, corpo e bullets bem definidos",
  inputSchema: z.object({
    title:   z.string().describe("Título do slide"),
    body:    z.string().describe("Texto principal ou subtítulo do slide"),
    bullets: z.array(z.string()).optional().describe("Lista de bullets para slides de conteúdo"),
  }),
  outputSchema: z.object({
    title:   z.string(),
    body:    z.string(),
    bullets: z.array(z.string()),
  }),
  execute: async (inputData) => {
    return {
      title:   inputData.title.trim(),
      body:    inputData.body.trim(),
      bullets: (inputData.bullets ?? []).map((b) => b.trim()).filter(Boolean),
    };
  },
});

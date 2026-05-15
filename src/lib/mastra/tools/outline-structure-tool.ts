import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { outlineItemSchema, type OutlineWorkflowOutput } from "@/schemas/app/outline-schema";

export const outlineStructureTool = createTool({
  id: "outline-structure-tool",
  description: "Valida e estrutura o outline completo da apresentação gerado pela IA",
  inputSchema: z.object({
    title:    z.string().describe("Título da apresentação"),
    outlines: z.array(outlineItemSchema).describe("Array de slides do outline"),
  }),
  outputSchema: z.object({
    title:    z.string(),
    outlines: z.array(outlineItemSchema),
  }),
  execute: async (inputData): Promise<OutlineWorkflowOutput> => {
    const outlines = inputData.outlines
      .map((s, i) => ({
        order:          s.order ?? i + 1,
        type:           s.type,
        title:          s.title.trim(),
        description:    s.description.trim(),
        concepts:       s.concepts.map((c) => c.trim()).filter(Boolean),
        representation: s.representation.trim(),
        layout:         s.layout.trim(),
      }))
      .sort((a, b) => a.order - b.order)

    return { title: inputData.title.trim(), outlines }
  },
})

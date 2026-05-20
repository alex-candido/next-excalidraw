import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  outlineItemSchema,
  outlineToolOutputSchema,
  type OutlineToolOutput,
} from "@/schemas/app/outline-schema";
import { REPRESENTATION_BY_TYPE } from "@/schemas/app/presentations/multi-schema";

export const outlineStructureTool = createTool({
  id: "outline-structure-tool",
  description: "Valida e estrutura o outline completo da apresentação gerado pela IA",
  inputSchema: z.object({
    title:    z.string().describe("Título da apresentação"),
    outlines: z.array(outlineItemSchema).describe("Array de slides do outline"),
  }),
  outputSchema: outlineToolOutputSchema,
  execute: async (inputData): Promise<OutlineToolOutput> => {
    const outlines = inputData.outlines
      .map((s, i) => {
        const allowed = REPRESENTATION_BY_TYPE[s.type]
        const representation = allowed && !allowed.includes(s.representation)
          ? "auto"
          : s.representation

        return {
          order:          s.order ?? i + 1,
          type:           s.type,
          title:          s.title.trim(),
          description:    (s.description ?? "").trim(),
          concepts:       (s.concepts ?? []).map((c) => c.trim()).filter(Boolean),
          representation: representation.trim(),
          layout:         (s.layout ?? "").trim(),
        }
      })
      .sort((a, b) => a.order - b.order)

    return { title: inputData.title.trim(), outlines }
  },
})

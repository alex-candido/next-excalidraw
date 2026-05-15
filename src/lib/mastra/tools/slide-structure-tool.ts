import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { slideWorkflowOutputSchema } from "@/schemas/app/slide-schema";
import { validateSkeletons } from "@/lib/excalidraw/parse/element-parser";
import { normalizeArrows } from "@/lib/excalidraw/normalize/arrows-normalizer";

export const slideStructureTool = createTool({
  id: "slide-structure-tool",
  description: "Valida e normaliza os elementos Excalidraw gerados pela IA para o slide",
  inputSchema: z.object({
    elements: z.array(z.record(z.string(), z.unknown())).describe("Array de ExcalidrawElementSkeleton gerados pela IA"),
  }),
  outputSchema: slideWorkflowOutputSchema,
  execute: async (inputData) => {
    const validated = validateSkeletons(inputData.elements)
    const normalized = normalizeArrows(validated)
    return { elements: normalized as Record<string, unknown>[] }
  },
})

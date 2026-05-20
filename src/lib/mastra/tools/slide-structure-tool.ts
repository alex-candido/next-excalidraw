import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { slideToolOutputSchema, type SlideToolOutput } from "@/schemas/app/slide-schema";
import { elementParser } from "@/lib/excalidraw/parse/element-parser";
import { arrowNormalizer } from "@/lib/excalidraw/normalize/arrows-normalizer";

export const slideStructureTool = createTool({
  id: "slide-structure-tool",
  description: "Valida e normaliza os elementos Excalidraw gerados pela IA para o slide",
  inputSchema: z.object({
    elements: z.array(z.record(z.string(), z.unknown())).describe("Array de ExcalidrawElementSkeleton gerados pela IA"),
  }),
  outputSchema: slideToolOutputSchema,
  execute: async (inputData): Promise<SlideToolOutput> => {
    const validated  = elementParser().validate(inputData.elements)
    const normalized = arrowNormalizer().normalize(validated)
    return { elements: normalized as Record<string, unknown>[] }
  },
})

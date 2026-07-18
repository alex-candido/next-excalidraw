import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { slideToolOutputSchema, type SlideToolOutput } from "@/schemas/app/slide-schema";
import { excalidrawSkeleton } from "@/lib/excalidraw";

export const slideStructureTool = createTool({
  id: "slide-structure-tool",
  description: "Valida e normaliza os elementos Excalidraw gerados pela IA para o slide",
  inputSchema: z.object({
    elements: z.array(z.record(z.string(), z.unknown())).describe("Array de ExcalidrawElementSkeleton gerados pela IA"),
  }),
  outputSchema: slideToolOutputSchema,
  execute: async (inputData): Promise<SlideToolOutput> => {
    // Sem context (tema/idioma/canvas) aqui dentro — a tool não tem acesso à
    // Presentation. O enriquecimento completo acontece no fechamento do
    // step, em slide-workflow.ts, que já tem esse contexto resolvido.
    const normalized = excalidrawSkeleton().fromAiOutput(inputData.elements)
    return { elements: normalized as Record<string, unknown>[] }
  },
})

import { createStep, createWorkflow } from "@mastra/core/workflows";
import { slideSemanticScorer } from "../scorers/slide-semantic-scorer";
import { buildSlideCreatorPrompt } from "../prompts/slide-creator-prompt";
import {
  slideWorkflowInputSchema,
  slideWorkflowOutputSchema,
  type SlideWorkflowOutput,
} from "@/schemas/app/slide-schema";
import { LANGUAGE_NAMES } from "@/schemas/app/presentation-schema";

const generateSlideStep = createStep({
  id: "generate-slide",
  inputSchema: slideWorkflowInputSchema,
  outputSchema: slideWorkflowOutputSchema,
  scorers: { slideSemanticScorer: { scorer: slideSemanticScorer } },
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("slideCreatorAgent")
    const language = LANGUAGE_NAMES[inputData.language] ?? "English"

    const instructions = buildSlideCreatorPrompt(inputData.type, inputData.representation)

    const parts: string[] = [
      `Tipo: ${inputData.type}`,
      `Título: ${inputData.title}`,
      `Descrição: ${inputData.description}`,
      `Representação visual: ${inputData.representation}`,
      `Idioma: ${language}`,
    ]
    if (inputData.layout) parts.push(`Layout desejado: ${inputData.layout}`)
    if (inputData.concepts.length) parts.push(`Conceitos-chave: ${inputData.concepts.join(", ")}`)

    const response = await agent.stream(
      [{ role: "user", content: parts.join("\n") }],
      { instructions },
    )
    const toolResults = await response.toolResults
    const toolResult = toolResults[0]
    return toolResult.payload.result as SlideWorkflowOutput
  },
})

export const slideWorkflow = createWorkflow({
  id: "slide-workflow",
  inputSchema: slideWorkflowInputSchema,
  outputSchema: slideWorkflowOutputSchema,
}).then(generateSlideStep)

slideWorkflow.commit()

import { createStep, createWorkflow } from "@mastra/core/workflows";
import { outlineSemanticScorer } from "../scorers/outline-semantic-scorer";
import {
  outlineWorkflowInputSchema,
  outlineWorkflowOutputSchema,
  type OutlineWorkflowOutput,
} from "@/schemas/app/outline-schema";
import { LANGUAGE_NAMES } from "@/schemas/app/presentation-schema";

const generateOutlineStep = createStep({
  id: "generate-outline",
  inputSchema: outlineWorkflowInputSchema,
  outputSchema: outlineWorkflowOutputSchema,
  scorers: { outlineSemanticScorer: { scorer: outlineSemanticScorer } },
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("outlineCreatorAgent")
    const language = LANGUAGE_NAMES[inputData.language] ?? "English"
    const slideCount = inputData.slideCount > 0 ? inputData.slideCount : "between 5 and 9"

    const parts: string[] = [
      `Prompt do usuário: ${inputData.userPrompt}`,
      `Idioma da apresentação: ${language}`,
      `Número de slides: ${slideCount}`,
    ]
    if (inputData.keywords?.length) {
      parts.push(`Palavras-chave: ${inputData.keywords.join(", ")}`)
    }

    const response = await agent.stream([
      { role: "user", content: parts.join("\n") },
    ])
    const toolResults = await response.toolResults
    const toolResult = toolResults[0]
    return toolResult.payload.result as OutlineWorkflowOutput
  },
})

export const outlineWorkflow = createWorkflow({
  id: "outline-workflow",
  inputSchema: outlineWorkflowInputSchema,
  outputSchema: outlineWorkflowOutputSchema,
}).then(generateOutlineStep)

outlineWorkflow.commit()

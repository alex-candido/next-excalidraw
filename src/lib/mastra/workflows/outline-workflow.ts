import {
  outlineWorkflowInputSchema,
  outlineWorkflowOutputSchema,
  type OutlineToolOutput,
  type OutlineWorkflowOutput,
} from "@/schemas/app/outline-schema";
import { LANGUAGE_NAMES } from "@/schemas/app/presentation-schema";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { mapWorkflowMetadata } from "../mappers/workflow-metadata-mapper";
import { outlineSemanticScorer } from "../scorers/outline-semantic-scorer";

const generateOutlineStep = createStep({
  id: "generate-outline",
  inputSchema: outlineWorkflowInputSchema,
  outputSchema: outlineWorkflowOutputSchema,
  scorers: { outlineSemanticScorer: { scorer: outlineSemanticScorer } },
  execute: async ({ inputData, mastra }) => {
    const startedAt = Date.now()
    const agent     = mastra.getAgent("outlineCreatorAgent")
    const language  = LANGUAGE_NAMES[inputData.language] ?? "English"
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

    const [toolResults, usage] = await Promise.all([
      response.toolResults,
      response.usage.catch(() => null),
    ])

    const result = toolResults[0].payload.result as OutlineToolOutput
    const modelName = process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-3-flash-preview"

    return {
      ...result,
      metadata: mapWorkflowMetadata({
        agentId:   "outline-creator-agent",
        startedAt,
        usage,
        modelName,
        context: {
          outlineCount:      result.outlines.length,
          presentationTitle: result.title,
        },
      }),
    } satisfies OutlineWorkflowOutput
  },
})

export const outlineWorkflow = createWorkflow({
  id: "outline-workflow",
  inputSchema: outlineWorkflowInputSchema,
  outputSchema: outlineWorkflowOutputSchema,
}).then(generateOutlineStep)

outlineWorkflow.commit()

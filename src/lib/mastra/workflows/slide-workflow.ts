import { createStep, createWorkflow } from "@mastra/core/workflows";
import { slideSemanticScorer } from "../scorers/slide-semantic-scorer";
import { buildSlideCreatorPrompt } from "../prompts/slide-creator-prompt";
import { mapWorkflowMetadata } from "../mappers/workflow-metadata-mapper";
import {
  slideWorkflowInputSchema,
  slideWorkflowOutputSchema,
  type SlideToolOutput,
  type SlideWorkflowOutput,
} from "@/schemas/app/slide-schema";
import { LANGUAGE_NAMES } from "@/schemas/app/presentation-schema"
import { CANVAS_DIMENSIONS } from "@/schemas/app/slide-schema";

const generateSlideStep = createStep({
  id: "generate-slide",
  inputSchema: slideWorkflowInputSchema,
  outputSchema: slideWorkflowOutputSchema,
  scorers: { slideSemanticScorer: { scorer: slideSemanticScorer } },
  execute: async ({ inputData, mastra }) => {
    const startedAt = Date.now()
    const agent       = mastra.getAgent("slideCreatorAgent")
    const language    = LANGUAGE_NAMES[inputData.language] ?? "English"
    const canvas      = CANVAS_DIMENSIONS[inputData.aspectRatio] ?? CANVAS_DIMENSIONS[0]
    const instructions = buildSlideCreatorPrompt(inputData.type, inputData.representation, canvas)

    const parts: string[] = [
      `Tipo: ${inputData.type}`,
      `Título: ${inputData.title}`,
      `Descrição: ${inputData.description}`,
      `Representação visual: ${inputData.representation}`,
      `Idioma: ${language}`,
    ]
    if (inputData.layout)          parts.push(`Layout desejado: ${inputData.layout}`)
    if (inputData.concepts.length) parts.push(`Conceitos-chave: ${inputData.concepts.join(", ")}`)

    const response = await agent.stream(
      [{ role: "user", content: parts.join("\n") }],
      { instructions },
    )

    const [toolResults, usage] = await Promise.all([
      response.toolResults,
      response.usage.catch(() => null),
    ])

    const result = toolResults[0].payload.result as SlideToolOutput
    const modelName = process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash"

    const slideBoundary = {
      type:            "rectangle",
      id:              "slide-boundary",
      x:               0,
      y:               0,
      width:           canvas.width,
      height:          canvas.height,
      strokeColor:     "#000000",
      backgroundColor: "transparent",
      fillStyle:       "hachure",
      strokeWidth:     1,
      strokeStyle:     "solid",
      roughness:       0,
      opacity:         100,
      locked:          true,
    }

    return {
      elements: [slideBoundary, ...result.elements],
      metadata: {
        ...mapWorkflowMetadata({
          agentId:   "slide-creator-agent",
          startedAt,
          usage,
          modelName,
          context: {
            slideOrder: inputData.order,
            outlineId:  inputData.outlineId,
          },
        }),
      },
    } satisfies SlideWorkflowOutput
  },
})

export const slideWorkflow = createWorkflow({
  id: "slide-workflow",
  inputSchema: slideWorkflowInputSchema,
  outputSchema: slideWorkflowOutputSchema,
}).then(generateSlideStep)

slideWorkflow.commit()

import { LANGUAGE_NAMES } from "@/schemas/app/presentation-schema";
import {
  CANVAS_DIMENSIONS,
  slideWorkflowInputSchema,
  slideWorkflowOutputSchema,
  type SlideToolOutput,
  type SlideWorkflowOutput,
} from "@/schemas/app/slide-schema";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { elementParser } from "@/lib/excalidraw/parse/element-parser";
import { workflowMetadataMapper } from "../mappers/workflow-metadata-mapper";
import { buildSlideCreatorPrompt } from "../prompts/slide-creator-prompt";
import { slideSemanticScorer } from "../scorers/slide-semantic-scorer";

const generateSlideStep = createStep({
  id: "generate-slide",
  inputSchema: slideWorkflowInputSchema,
  outputSchema: slideWorkflowOutputSchema,
  scorers: { slideSemanticScorer: { scorer: slideSemanticScorer } },
  execute: async ({ inputData, mastra }) => {
    const startedAt = Date.now()
    const agent       = mastra.getAgent("slideCreatorAgent")
    const language    = LANGUAGE_NAMES[inputData.language] ?? "English"
    const canvas  = CANVAS_DIMENSIONS[inputData.aspectRatio] ?? CANVAS_DIMENSIONS[0]
    const context = inputData.amount !== undefined
      ? { amount: inputData.amount, audience: inputData.audience ?? 0, scenario: inputData.scenario ?? 0, theme: inputData.theme ?? 0 }
      : undefined
    const instructions = buildSlideCreatorPrompt(inputData.type, inputData.representation, canvas, context)

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

    const toolResults = await response.toolResults

    let elements: SlideToolOutput["elements"]
    const parser = elementParser()

    if (toolResults?.length && toolResults[0]?.payload) {
      elements = (toolResults[0].payload.result as SlideToolOutput).elements
    } else {
      const text = await response.text
      if (text?.trim()) {
        elements = parser.parse(text)
      } else {
        throw new Error("Agent returned no tool results and no text output")
      }
    }

    const usage = await response.usage.catch(() => null)

    const result: SlideToolOutput = { elements: parser.validate(elements as unknown[]) }
    const modelName = process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-3-flash-preview"

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
        ...workflowMetadataMapper().map({
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

import { LANGUAGE_NAMES, THEME_KEYS } from "@/schemas/app/presentation-schema";
import {
  CANVAS_DIMENSIONS,
  slideWorkflowInputSchema,
  slideWorkflowOutputSchema,
  type SlideToolOutput,
  type SlideWorkflowOutput,
} from "@/schemas/app/slide-schema";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { excalidrawSkeleton } from "@/lib/excalidraw";
import { PresentationLanguage } from "@/lib/drizzle/schema/presentation";
import { workflowMetadataMapper } from "../mappers/workflow-metadata-mapper";
import { buildSlideCreatorPrompt } from "../prompts/slide-creator-prompt";
import { slideSemanticScorer } from "../scorers/slide-semantic-scorer";

// elementSizing() (usado pelo text-wrapper) espera os códigos curtos que já
// usa em seus próprios testes ("ptBR", "es", ...) — diferente do
// LANGUAGE_CODES de presentation-schema.ts (uppercase, "PT" em vez de
// "ptBR"), que serve a um propósito diferente (exibição na UI).
const SIZING_LANGUAGE_CODE: Record<number, string> = {
  [PresentationLanguage.en]:   "en",
  [PresentationLanguage.es]:   "es",
  [PresentationLanguage.fr]:   "fr",
  [PresentationLanguage.de]:   "de",
  [PresentationLanguage.it]:   "it",
  [PresentationLanguage.ptBR]: "ptBR",
  [PresentationLanguage.ru]:   "ru",
  [PresentationLanguage.zh]:   "zh",
  [PresentationLanguage.ja]:   "ja",
  [PresentationLanguage.ko]:   "ko",
}

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
    const skeleton = excalidrawSkeleton()

    if (toolResults?.length && toolResults[0]?.payload) {
      elements = (toolResults[0].payload.result as SlideToolOutput).elements
    } else {
      const text = await response.text
      if (text?.trim()) {
        elements = skeleton.parse(text)
      } else {
        throw new Error("Agent returned no tool results and no text output")
      }
    }

    const usage = await response.usage.catch(() => null)

    const themeKey = THEME_KEYS[inputData.theme ?? 0] ?? "daktilo"
    const enrichmentContext = {
      palette:       skeleton.theme.getByKey(themeKey).palette,
      semanticRoles: skeleton.theme.getSemanticRoles(themeKey),
      canvasWidth:   canvas.width,
      language:      SIZING_LANGUAGE_CODE[inputData.language] ?? "en",
    }

    // fromAiOutput roda de novo aqui mesmo pro caminho da tool (que já
    // normalizou internamente, sem o enrichmentContext) — é idempotente, e
    // garante que o fallback de texto livre (sem tool call) também passe
    // pelo pipeline completo (incluindo tema/wrap/grid), não só repair/order/
    // arrows. Ver skeleton-pipeline.ts.
    const result: SlideToolOutput = {
      elements: skeleton.fromAiOutput(elements as unknown[], enrichmentContext),
    }
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

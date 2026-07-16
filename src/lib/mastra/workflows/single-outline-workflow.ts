import {
  singleWorkflowInputSchema,
  singleWorkflowOutputSchema,
  type SingleWorkflowOutput,
} from "@/schemas/app/presentations/single-schema"
import { type OutlineToolOutput } from "@/schemas/app/outline-schema"
import { LANGUAGE_NAMES } from "@/schemas/app/presentation-schema"
import { createStep, createWorkflow } from "@mastra/core/workflows"
import { attachmentMessageMapper } from "../mappers/attachment-message-mapper"
import { workflowMetadataMapper } from "../mappers/workflow-metadata-mapper"
import { outlineSemanticScorer } from "../scorers/outline-semantic-scorer"

const generateSingleOutlineStep = createStep({
  id:           "generate-single-outline",
  inputSchema:  singleWorkflowInputSchema,
  outputSchema: singleWorkflowOutputSchema,
  scorers: { outlineSemanticScorer: { scorer: outlineSemanticScorer } },
  execute: async ({ inputData, mastra }) => {
    const startedAt = Date.now()
    const agent     = mastra.getAgent("singleOutlineCreatorAgent")
    const language  = LANGUAGE_NAMES[inputData.language] ?? "English"

    const content = attachmentMessageMapper().buildContent(
      `Prompt do usuário: ${inputData.userPrompt}\nIdioma: ${language}`,
      inputData.attachments,
    )

    const response = await agent.stream([
      { role: "user", content },
    ])

    const [toolResults, usage] = await Promise.all([
      response.toolResults,
      response.usage.catch(() => null),
    ])

    const toolPayload = toolResults?.[0]?.payload
    if (!toolPayload || toolPayload.isError) {
      throw new Error(
        (toolPayload?.result as { message?: string })?.message ?? "Tool execution failed",
      )
    }

    const result    = toolPayload.result as OutlineToolOutput
    const modelName = process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-3-flash-preview"

    return {
      ...result,
      metadata: workflowMetadataMapper().map({
        agentId:   "single-outline-creator-agent",
        startedAt,
        usage,
        modelName,
        context: {
          outlineCount:      result.outlines.length,
          presentationTitle: result.title,
        },
      }),
    } satisfies SingleWorkflowOutput
  },
})

export const singleOutlineWorkflow = createWorkflow({
  id:           "single-outline-workflow",
  inputSchema:  singleWorkflowInputSchema,
  outputSchema: singleWorkflowOutputSchema,
}).then(generateSingleOutlineStep)

singleOutlineWorkflow.commit()

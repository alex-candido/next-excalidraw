import { z } from "zod"

export const workflowMetaBaseSchema = z.object({
  mastra: z.object({
    agentId:  z.string(),
    traceId:  z.string(),
    version:  z.string(),
    duration: z.number(),
    steps:    z.array(z.unknown()),
  }),
  usage: z.object({
    promptTokens:     z.number(),
    completionTokens: z.number(),
    totalTokens:      z.number(),
    cost:             z.number(),
    currency:         z.string(),
  }),
  model: z.object({
    name:     z.string(),
    provider: z.string(),
  }),
})

export type WorkflowMetaBase = z.infer<typeof workflowMetaBaseSchema>

type RawUsage = { inputTokens?: number; outputTokens?: number } | null

export function mapWorkflowMetadata<T extends Record<string, unknown>>(params: {
  agentId:   string
  startedAt: number
  usage:     RawUsage
  modelName: string
  context:   T
}) {
  const { agentId, startedAt, usage, modelName, context } = params
  const inputTokens  = usage?.inputTokens  ?? 0
  const outputTokens = usage?.outputTokens ?? 0

  return {
    mastra: {
      agentId,
      traceId:  crypto.randomUUID(),
      version:  "1.0.0",
      duration: Date.now() - startedAt,
      steps:    [] as unknown[],
    },
    usage: {
      promptTokens:     inputTokens,
      completionTokens: outputTokens,
      totalTokens:      inputTokens + outputTokens,
      cost:             0,
      currency:         "USD",
    },
    model: {
      name:     modelName,
      provider: "google",
    },
    context,
  }
}

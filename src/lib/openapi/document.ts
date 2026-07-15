import { createDocument } from "zod-openapi"
import { z } from "zod"

import {
  presentationCreateResultSchema,
  presentationCreateSchema,
  presentationGenerateResponseSchema,
  presentationGenerateSchema,
  presentationSchema,
  presentationWithOutlinesSchema,
} from "@/schemas/app/presentation-schema"
import {
  outlineBulkUpdateSchema,
  outlineRegenerateResponseSchema,
  outlineRegenerateSchema,
} from "@/schemas/app/presentations/multi-schema"
import {
  slideBulkUpdateSchema,
  slideGenerateResponseSchema,
  slideGenerateSchema,
  slideRegenerateResponseSchema,
  slideRegenerateSchema,
  slideSchema,
} from "@/schemas/app/slide-schema"

const errorResponseSchema = z.object({
  error: z.union([z.string(), z.record(z.string(), z.unknown())]),
})

const presentationIdParams = z.object({ id: z.string().uuid() })
const outlineIdParams = presentationIdParams.extend({ outlineId: z.string().uuid() })
const slideIdParams = presentationIdParams.extend({ slideId: z.string().uuid() })

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Next Excalidraw API",
    version: "1.0.0",
    description: "Rotas dinâmicas do módulo app (presentations/outlines/slides).",
  },
  servers: [{ url: "/api/v1/app" }],
  tags: [
    { name: "Presentations" },
    { name: "Outlines" },
    { name: "Slides" },
  ],
  paths: {
    "/presentations": {
      get: {
        tags: ["Presentations"],
        summary: "Listar apresentações do usuário",
        responses: {
          "200": {
            description: "Lista de apresentações",
            content: { "application/json": { schema: z.object({ presentations: z.array(presentationSchema) }) } },
          },
        },
      },
      post: {
        tags: ["Presentations"],
        summary: "Criar apresentação (draft)",
        requestBody: { content: { "application/json": { schema: presentationCreateSchema } } },
        responses: {
          "201": {
            description: "Apresentação criada",
            content: { "application/json": { schema: presentationCreateResultSchema } },
          },
          "400": {
            description: "Input inválido",
            content: { "application/json": { schema: errorResponseSchema } },
          },
        },
      },
    },
    "/presentations/{id}": {
      get: {
        tags: ["Presentations"],
        summary: "Detalhe da apresentação (com outlines)",
        requestParams: { path: presentationIdParams },
        responses: {
          "200": {
            description: "Apresentação com outlines",
            content: { "application/json": { schema: presentationWithOutlinesSchema } },
          },
          "403": { description: "Apresentação de outro usuário", content: { "application/json": { schema: errorResponseSchema } } },
          "404": { description: "Não encontrada", content: { "application/json": { schema: errorResponseSchema } } },
        },
      },
      delete: {
        tags: ["Presentations"],
        summary: "Mover apresentação pra lixeira (soft-delete)",
        requestParams: { path: presentationIdParams },
        responses: {
          "204": { description: "Status alterado pra trash — exclusão definitiva acontece depois, via job de retenção" },
          "403": { description: "Apresentação de outro usuário", content: { "application/json": { schema: errorResponseSchema } } },
          "404": { description: "Não encontrada", content: { "application/json": { schema: errorResponseSchema } } },
        },
      },
    },
    "/presentations/{id}/outlines/generate": {
      post: {
        tags: ["Outlines"],
        summary: "Gerar outlines via IA (background job via Inngest)",
        requestParams: { path: presentationIdParams },
        requestBody: { content: { "application/json": { schema: presentationGenerateSchema } } },
        responses: {
          "202": {
            description: "Processamento iniciado em background — sempre `{status: \"pending\", generationId}`. Cliente precisa dar poll em GET /presentations/:id (outlines aparecem populados quando o job termina)",
            content: { "application/json": { schema: presentationGenerateResponseSchema } },
          },
          "404": { description: "Não encontrada", content: { "application/json": { schema: errorResponseSchema } } },
        },
      },
    },
    "/presentations/{id}/outlines": {
      patch: {
        tags: ["Outlines"],
        summary: "Atualizar outlines em bulk",
        requestParams: { path: presentationIdParams },
        requestBody: { content: { "application/json": { schema: outlineBulkUpdateSchema } } },
        responses: {
          "200": {
            description: "Quantidade de outlines atualizados",
            content: { "application/json": { schema: z.object({ updated: z.number().int() }) } },
          },
        },
      },
    },
    "/presentations/{id}/outlines/{outlineId}/generate": {
      post: {
        tags: ["Outlines"],
        summary: "Regenerar um outline individual (background job via Inngest)",
        requestParams: { path: outlineIdParams },
        requestBody: { content: { "application/json": { schema: outlineRegenerateSchema } } },
        responses: {
          "202": {
            description: "Processamento iniciado em background — sempre `{status: \"pending\", generationId}`. Poll em GET /presentations/:id",
            content: { "application/json": { schema: outlineRegenerateResponseSchema } },
          },
        },
      },
    },
    "/presentations/{id}/slides": {
      get: {
        tags: ["Slides"],
        summary: "Listar slides da apresentação",
        requestParams: { path: presentationIdParams },
        responses: {
          "200": {
            description: "Lista de slides",
            content: { "application/json": { schema: z.object({ slides: z.array(slideSchema) }) } },
          },
        },
      },
      patch: {
        tags: ["Slides"],
        summary: "Salvar estado dos slides (editor)",
        requestParams: { path: presentationIdParams },
        requestBody: { content: { "application/json": { schema: slideBulkUpdateSchema } } },
        responses: {
          "200": {
            description: "Quantidade de slides atualizados",
            content: { "application/json": { schema: z.object({ updated: z.number().int() }) } },
          },
        },
      },
    },
    "/presentations/{id}/slides/generate": {
      post: {
        tags: ["Slides"],
        summary: "Gerar slides via IA (background job via Inngest)",
        requestParams: { path: presentationIdParams },
        requestBody: { content: { "application/json": { schema: slideGenerateSchema } } },
        responses: {
          "202": {
            description: "Processamento iniciado em background — sempre `{status: \"pending\", generationId}`. Poll em GET /presentations/:id/slides",
            content: { "application/json": { schema: slideGenerateResponseSchema } },
          },
        },
      },
    },
    "/presentations/{id}/slides/{slideId}/generate": {
      post: {
        tags: ["Slides"],
        summary: "Regenerar um slide individual (background job via Inngest)",
        requestParams: { path: slideIdParams },
        requestBody: { content: { "application/json": { schema: slideRegenerateSchema } } },
        responses: {
          "202": {
            description: "Processamento iniciado em background — sempre `{status: \"pending\", generationId}`. Poll em GET /presentations/:id/slides",
            content: { "application/json": { schema: slideRegenerateResponseSchema } },
          },
        },
      },
    },
  },
})

import { mastra } from "@/lib/mastra"
import { attachmentUtils } from "@/lib/utils/attachment"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { presentationEntryRepository } from "@/server/repositories/app/presentation-entry-repository"
import { outlineRepository } from "@/server/repositories/app/outline-repository"
import { generationRepository } from "@/server/repositories/app/generation-repository"
import { attachmentRepository } from "@/server/repositories/app/attachment-repository"
import { OutlineType, OutlineRepresentation } from "@/lib/drizzle/schema/outline"
import { PresentationStatus } from "@/lib/drizzle/schema/presentation"
import { GenerationStatus } from "@/lib/drizzle/schema/generation"
import type { OutlineWorkflowOutput } from "@/schemas/app/outline-schema"
import type { MultiGenerate, OutlineRegenerate, OutlineRegenerateAll, OutlineBulkUpdate } from "@/schemas/app/presentations/multi-schema"

function slugify(text: string, code: string) {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${base}-${code}`
}

export function multiOutlineService() {
  async function generate(presentationId: string, generationId: string, userId: string, input: MultiGenerate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    // Anexos são material de referência de uso único — buscados aqui (não fazem
    // parte do input da rota) e apagados no final, sucesso ou falha (ver finally).
    // Busca + processamento ficam DENTRO do try: se algo inesperado quebrar aqui,
    // a geração ainda é marcada como falha e os anexos ainda são limpos.
    const attachmentRows = await attachmentRepository().findByPresentationId(presentationId)

    try {
      const attachments = await attachmentUtils().buildContext(attachmentRows)

      const workflow = mastra.getWorkflow("multiOutlineWorkflow")
      const run      = await workflow.createRun()
      const { result } = await run.start({ inputData: { ...input, attachments } }) as { result: OutlineWorkflowOutput }

      const outlines = await outlineRepository().createMany(
        result.outlines.map((item, i) => ({
          presentationId,
          // Posição no array já é a fonte de verdade (0-indexed, mesma
          // convenção do resto do app — reorder/add/delete no client, e
          // slide-service.ts na geração de slides). Ignora item.order (a IA
          // reporta 1-indexed, "começa em 1", pro próprio raciocínio dela —
          // não é o valor que persistimos).
          order:          i,
          type:           OutlineType[item.type as keyof typeof OutlineType],
          title:          item.title,
          description:    item.description,
          concepts:       item.concepts,
          representation: OutlineRepresentation[item.representation as keyof typeof OutlineRepresentation],
          layout:         item.layout,
        })),
      )

      await presentationRepository().update(presentationId, {
        title:  result.title,
        slug:   slugify(result.title, presentation.code),
        status: PresentationStatus.active,
      })

      await generationRepository().update(generationId, {
        status:      GenerationStatus.completed,
        completedAt: new Date(),
        usage:       result.metadata.usage as Record<string, unknown>,
        model:       { name: result.metadata.model } as Record<string, unknown>,
      })

      return {
        presentationId,
        title: result.title,
        outlines: outlines.map((o) => ({
          id:             o.id,
          order:          o.order,
          type:           o.type,
          title:          o.title,
          description:    o.description,
          concepts:       o.concepts,
          representation: o.representation,
          layout:         o.layout,
        })),
      }
    } catch (err) {
      await generationRepository().update(generationId, {
        status:      GenerationStatus.failed,
        completedAt: new Date(),
      })
      throw err
    } finally {
      if (attachmentRows.length > 0) {
        await attachmentRepository().deleteByPresentationId(presentationId).catch(() => {})
      }
    }
  }

  async function bulkUpdate(presentationId: string, userId: string, input: OutlineBulkUpdate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const updated = await outlineRepository().bulkUpdate(input.outlines)
    return { updated }
  }

  async function regenerate(presentationId: string, outlineId: string, generationId: string, userId: string, input: OutlineRegenerate) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    try {
      const workflow = mastra.getWorkflow("multiOutlineWorkflow")
      const run      = await workflow.createRun()
      const { result } = await run.start({
        inputData: {
          userPrompt: input.userPrompt,
          language:   input.language,
          slideCount: 1,
        },
      }) as { result: OutlineWorkflowOutput }

      const item = result.outlines[0]
      if (!item) throw new Error("Workflow returned no outlines")

      // concepts/layout entravam no retorno abaixo mas nunca eram persistidos
      // aqui — o retorno parecia trazer valor fresco, mas `updated.concepts`/
      // `updated.layout` só refletiam o que já estava salvo (não mudava nada).
      const updated = await outlineRepository().update(outlineId, {
        title:          item.title,
        description:    item.description,
        concepts:       item.concepts,
        representation: OutlineRepresentation[item.representation as keyof typeof OutlineRepresentation],
        layout:         item.layout,
      })

      await generationRepository().update(generationId, {
        status:      GenerationStatus.completed,
        completedAt: new Date(),
        usage:       result.metadata.usage as Record<string, unknown>,
        model:       { name: result.metadata.model } as Record<string, unknown>,
      })

      return {
        id:             updated.id,
        order:          updated.order,
        type:           updated.type,
        title:          updated.title,
        description:    updated.description,
        concepts:       updated.concepts,
        representation: updated.representation,
        layout:         updated.layout,
      }
    } catch (err) {
      await generationRepository().update(generationId, {
        status:      GenerationStatus.failed,
        completedAt: new Date(),
      })
      throw err
    }
  }

  // "Regenerar tudo" — commita o rascunho de prompt+parâmetros (persiste em
  // presentation_entry) e recria o outline inteiro do zero, podendo mudar a
  // quantidade de cenas (slideCount novo). Diferente de regenerate() acima,
  // que só atualiza 1 item existente mantendo quantidade/ordem.
  async function regenerateAll(presentationId: string, generationId: string, userId: string, input: OutlineRegenerateAll) {
    const presentation = await presentationRepository().findById(presentationId)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    await presentationEntryRepository().updateParamsByPresentationId(presentationId, {
      prompt:      input.userPrompt,
      language:    input.language,
      aspectRatio: input.aspectRatio,
      slideCount:  input.slideCount,
      audience:    input.audience,
      scenario:    input.scenario,
      amount:      input.amount,
      theme:       input.theme,
    })

    try {
      const workflow = mastra.getWorkflow("multiOutlineWorkflow")
      const run      = await workflow.createRun()
      const { result } = await run.start({
        inputData: {
          userPrompt: input.userPrompt,
          language:   input.language,
          slideCount: input.slideCount,
          amount:     input.amount,
          audience:   input.audience,
          scenario:   input.scenario,
          theme:      input.theme,
        },
      }) as { result: OutlineWorkflowOutput }

      await outlineRepository().deleteByPresentationId(presentationId)

      const outlines = await outlineRepository().createMany(
        result.outlines.map((item, i) => ({
          presentationId,
          // Posição no array já é a fonte de verdade (0-indexed, mesma
          // convenção do resto do app — reorder/add/delete no client, e
          // slide-service.ts na geração de slides). Ignora item.order (a IA
          // reporta 1-indexed, "começa em 1", pro próprio raciocínio dela —
          // não é o valor que persistimos).
          order:          i,
          type:           OutlineType[item.type as keyof typeof OutlineType],
          title:          item.title,
          description:    item.description,
          concepts:       item.concepts,
          representation: OutlineRepresentation[item.representation as keyof typeof OutlineRepresentation],
          layout:         item.layout,
        })),
      )

      await presentationRepository().update(presentationId, {
        title: result.title,
        slug:  slugify(result.title, presentation.code),
      })

      await generationRepository().update(generationId, {
        status:      GenerationStatus.completed,
        completedAt: new Date(),
        usage:       result.metadata.usage as Record<string, unknown>,
        model:       { name: result.metadata.model } as Record<string, unknown>,
      })

      return {
        title: result.title,
        outlines: outlines.map((o) => ({
          id:             o.id,
          order:          o.order,
          type:           o.type,
          title:          o.title,
          description:    o.description,
          concepts:       o.concepts,
          representation: o.representation,
          layout:         o.layout,
        })),
      }
    } catch (err) {
      await generationRepository().update(generationId, {
        status:      GenerationStatus.failed,
        completedAt: new Date(),
      })
      throw err
    }
  }

  return { generate, bulkUpdate, regenerate, regenerateAll }
}

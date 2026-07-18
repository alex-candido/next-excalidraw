import { randomBytes, randomUUID } from "crypto"
import { db } from "@/lib/drizzle"
import { presentationRepository } from "@/server/repositories/app/presentation-repository"
import { presentationFavoriteRepository } from "@/server/repositories/app/presentation-favorite-repository"
import { outlineRepository } from "@/server/repositories/app/outline-repository"
import { slideRepository } from "@/server/repositories/app/slide-repository"
import { presentationEntryService } from "@/server/services/app/presentation-entry-service"
import { storageService } from "@/server/services/storage-service"
import { PresentationStatus, PresentationType } from "@/lib/drizzle/schema/presentation"
import { StorageRecordType } from "@/lib/drizzle/schema/storage-attachment"
import type { PresentationCreate } from "@/schemas/app/presentation-schema"

function generateCode() {
  return randomBytes(4).toString("hex")
}

export type PresentationListTab = "all" | "recent" | "multi" | "single" | "favorites" | "trash"

interface PresentationListParams {
  tab: PresentationListTab
  visibility?: number
  search?: string
  cursor?: string
  limit?: number
}

// Múltiplo de 3 — grid da listagem é `lg:grid-cols-3`, então cada página
// completa linhas em vez de deixar a última "faltando" um card.
const LIST_PAGE_SIZE_DEFAULT = 9
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000

// Cursor opaco pro client — "createdAt|id" do último item da página. Não
// precisa de encoding extra (base64 etc): os dois valores já são URL-safe
// via URLSearchParams, e "|" nunca aparece num ISO date nem num uuid.
function decodeCursor(cursor?: string) {
  if (!cursor) return undefined
  const [createdAt, id] = cursor.split("|")
  if (!createdAt || !id) return undefined
  return { createdAt: new Date(createdAt), id }
}

// `item.createdAt` é um `Date` de verdade em runtime (o repository devolve o
// valor cru do driver, `z.string()` no schema só descreve o formato depois
// de serializado por `Response.json()`) — força ISO explícito aqui, senão
// vira `Date.toString()` (formato local, não parseável de volta com segurança).
function encodeCursor(item: { createdAt: string | Date; id: string }) {
  return `${new Date(item.createdAt).toISOString()}|${item.id}`
}

export function presentationService() {
  async function create(userId: string, input: PresentationCreate) {
    const code = generateCode()
    const slug = code

    // Transação: presentation sem presentation_entry é inutilizável (não sobra
    // parâmetro de geração em lugar nenhum) — se o insert da entry falhar, o
    // insert da presentation também precisa desfazer, não pode ficar órfã.
    return db.transaction(async (tx) => {
      const row = await presentationRepository().create({
        userId,
        code,
        slug,
        title:  input.title?.trim() || "Untitled",
        status: PresentationStatus.draft,
      }, tx)

      // Sempre cria uma presentation_entry nova (kind=custom, 1:1 com a
      // presentation) — seja o prompt/parâmetros 100% digitados pelo usuário ou
      // vindos de uma suggestion sem edição (ver decisions.md). sourceSuggestionId
      // só preenche source_suggestion_id, pra métrica de popularidade — nunca
      // pula a criação da entry em si.
      await presentationEntryService().logCustomEntry(row.id, {
        type: input.type,
        language: input.language,
        prompt: input.userPrompt ?? "",
        aspectRatio: input.aspectRatio,
        slideCount: input.slideCount,
        amount: input.amount,
        audience: input.audience,
        scenario: input.scenario,
        theme: input.theme,
        keywords: input.keywords,
        sourceSuggestionId: input.sourceSuggestionId,
      }, tx)

      return { presentationId: row.id, type: input.type }
    })
  }

  async function findById(id: string, userId: string) {
    const presentation = await presentationRepository().findById(id)
    if (!presentation) throw Object.assign(new Error("Presentation not found"), { status: 404 })
    if (presentation.userId !== userId) throw Object.assign(new Error("Forbidden"), { status: 403 })

    const outlines = await outlineRepository().findByPresentationId(id)
    return { ...presentation, outlines }
  }

  async function list(userId: string, params: PresentationListParams) {
    const limit = params.limit ?? LIST_PAGE_SIZE_DEFAULT

    const { items, hasMore } = await presentationRepository().findManyPaginated(userId, {
      scope: params.tab === "trash" ? "trash" : "active",
      type:
        params.tab === "multi" ? PresentationType.multi :
        params.tab === "single" ? PresentationType.single :
        undefined,
      recentSince: params.tab === "recent" ? new Date(Date.now() - RECENT_WINDOW_MS) : undefined,
      favoritesOnly: params.tab === "favorites",
      visibility: params.visibility,
      search: params.search,
      cursor: decodeCursor(params.cursor),
      limit,
    })

    return {
      presentations: items,
      nextCursor: hasMore && items.length > 0 ? encodeCursor(items[items.length - 1]) : null,
    }
  }

  async function trashCount(userId: string) {
    return presentationRepository().count(userId, PresentationStatus.trash)
  }

  // Toggle instantâneo, sem confirmação (modelo "like" de rede social) —
  // diferente de moveToTrash/remove, que são destrutivos e pedem confirmação.
  async function favorite(id: string, userId: string) {
    await findById(id, userId)
    await presentationFavoriteRepository().create(id, userId)
  }

  async function unfavorite(id: string, userId: string) {
    await findById(id, userId)
    await presentationFavoriteRepository().remove(id, userId)
  }

  async function favoritesCount(userId: string) {
    return presentationFavoriteRepository().count(userId)
  }

  // Mover pra lixeira também remove o favorito — "favorito na lixeira" não faz
  // sentido pro usuário (decidido em conversa, 2026-07-18). Restaurar NÃO
  // devolve o favorito de volta, precisa favoritar de novo.
  async function moveToTrash(id: string, userId: string) {
    await findById(id, userId)
    await presentationFavoriteRepository().remove(id, userId)
    return presentationRepository().update(id, { status: PresentationStatus.trash })
  }

  // Não guardamos o status anterior ao mandar pra lixeira — volta sempre pra
  // `active` (estado normal de uma presentation já gerada; `draft` dispararia
  // de novo a UI de "ainda não tem outline" mesmo pra uma presentation completa).
  async function restore(id: string, userId: string) {
    await findById(id, userId)
    return presentationRepository().update(id, { status: PresentationStatus.active })
  }

  async function restoreAll(userId: string) {
    const all = await presentationRepository().findMany(userId)
    const trashed = all.filter((p) => p.status === PresentationStatus.trash)

    for (const p of trashed) {
      await presentationRepository().update(p.id, { status: PresentationStatus.active })
    }

    return trashed.length
  }

  async function emptyTrash(userId: string) {
    const all = await presentationRepository().findMany(userId)
    const trashed = all.filter((p) => p.status === PresentationStatus.trash)

    for (const p of trashed) {
      await remove(p.id, userId)
    }

    return trashed.length
  }

  async function rename(id: string, userId: string, title: string) {
    await findById(id, userId)
    return presentationRepository().update(id, { title })
  }

  async function duplicate(id: string, userId: string) {
    const source = await findById(id, userId)
    const slides = await slideRepository().findByPresentationId(id)
    const code   = generateCode()

    return db.transaction(async (tx) => {
      const cloned = await presentationRepository().create({
        userId,
        code,
        slug:  code,
        title: `${source.title} (cópia)`,
        status: source.status,
      }, tx)

      await presentationEntryService().logCustomEntry(cloned.id, {
        type:        source.entry.type,
        language:    source.entry.language,
        prompt:      source.entry.prompt,
        aspectRatio: source.entry.aspectRatio,
        slideCount:  source.entry.slideCount,
        amount:      source.entry.amount,
        audience:    source.entry.audience,
        scenario:    source.entry.scenario,
        theme:       source.entry.theme,
        keywords:    source.entry.keywords ?? undefined,
      }, tx)

      // outline_id de slide aponta pro outline correspondente — o mapeamento
      // id antigo → novo é decidido aqui (IDs gerados na mão, não via default
      // do banco), pra não depender da ordem de retorno de um INSERT em lote.
      const outlineIdMap = new Map<string, string>()
      if (source.outlines.length > 0) {
        await outlineRepository().createMany(
          source.outlines.map((o) => {
            const newId = randomUUID()
            outlineIdMap.set(o.id, newId)
            return {
              id:             newId,
              presentationId: cloned.id,
              order:          o.order,
              type:           o.type,
              title:          o.title,
              description:    o.description,
              concepts:       o.concepts,
              representation: o.representation,
              layout:         o.layout,
            }
          }),
          tx,
        )
      }

      if (slides.length > 0) {
        await slideRepository().createMany(
          slides.map((s) => ({
            presentationId: cloned.id,
            outlineId:      outlineIdMap.get(s.outlineId)!,
            order:          s.order,
            elements:       s.elements,
            appState:       s.appState,
            files:          s.files,
            status:         s.status,
          })),
          tx,
        )
      }

      return { id: cloned.id }
    })
  }

  // Hard-delete de verdade — diferente de moveToTrash (soft). Nunca chamar
  // presentationRepository().remove() direto, senão o storage de thumbnail
  // (sem FK real, ver storage-repository.ts) fica órfão no banco e no R2.
  async function remove(id: string, userId: string) {
    await findById(id, userId)

    const slides = await slideRepository().findByPresentationId(id)
    await storageService().deleteForRecords(StorageRecordType.slide, slides.map((s) => s.id))

    await presentationRepository().remove(id)
  }

  const TRASH_RETENTION_DAYS = 30

  // Chamado pelo job de retenção (scheduled-maintenance.ts) — varre a lixeira
  // de todos os usuários, não uma request autenticada, por isso usa o próprio
  // userId de cada linha encontrada (a checagem de ownership em remove() vira
  // um no-op consigo mesma, mas mantém um único caminho de remoção real).
  async function purgeTrashed() {
    const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000)
    const trashed = await presentationRepository().findTrashedBefore(cutoff)

    for (const p of trashed) {
      await remove(p.id, p.userId)
    }

    return trashed.length
  }

  return {
    create,
    findById,
    list,
    trashCount,
    favorite,
    unfavorite,
    favoritesCount,
    moveToTrash,
    restore,
    restoreAll,
    emptyTrash,
    rename,
    duplicate,
    remove,
    purgeTrashed,
  }
}

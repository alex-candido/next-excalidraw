import { db, type DbClient } from "@/lib/drizzle"
import { PresentationEntryKind, PresentationEntryStatus, presentationEntry } from "@/lib/drizzle/schema/presentation-entry"
import { presentation } from "@/lib/drizzle/schema/presentation"
import { and, eq } from "drizzle-orm"

export type PresentationEntryInsert = typeof presentationEntry.$inferInsert
export type PresentationEntryParamsUpdate = Partial<
  Pick<PresentationEntryInsert, "prompt" | "language" | "aspectRatio" | "slideCount" | "audience" | "scenario" | "amount" | "theme">
>

export function presentationEntryRepository() {
  // Sem exclude/limit/random aqui de propósito — essa lista inteira é o que
  // fica em cache (chave só por type+language), pra caber sempre; embaralhar/
  // excluir roda em código depois de ler do cache, ver presentationEntryService().
  async function findActiveSuggestions(params: { type: number; language: number }) {
    return db
      .select()
      .from(presentationEntry)
      .where(and(
        eq(presentationEntry.kind, PresentationEntryKind.suggestion),
        eq(presentationEntry.status, PresentationEntryStatus.active),
        eq(presentationEntry.type, params.type),
        eq(presentationEntry.language, params.language),
      ))
  }

  async function findById(id: string) {
    return db.query.presentationEntry.findFirst({ where: eq(presentationEntry.id, id) }) ?? null
  }

  async function createCustom(data: PresentationEntryInsert, client: DbClient = db) {
    const [row] = await client.insert(presentationEntry).values(data).returning()
    return row
  }

  // Commit do rascunho de prompt+parâmetros do Outline (ver "Regenerar tudo")
  // — busca a entry pelo presentationId porque a página de outline só tem o
  // id da presentation, não o id da entry.
  async function updateParamsByPresentationId(presentationId: string, data: PresentationEntryParamsUpdate) {
    const [row] = await db
      .update(presentationEntry)
      .set(data)
      .where(and(eq(presentationEntry.presentationId, presentationId), eq(presentationEntry.kind, PresentationEntryKind.custom)))
      .returning()
    return row
  }

  // Usado por metricsService() — type (multi/single) e prompt (vazio = criada
  // em branco, sem IA) de cada presentation do usuário, pra computar os stats
  // em código em vez de SQL de agregação (poucas linhas por usuário, não vale
  // a complexidade de um `count() filter (where ...)`).
  async function findTypeAndOriginByUser(userId: string) {
    return db
      .select({ type: presentationEntry.type, origin: presentationEntry.origin })
      .from(presentationEntry)
      .innerJoin(presentation, eq(presentationEntry.presentationId, presentation.id))
      .where(and(eq(presentation.userId, userId), eq(presentationEntry.kind, PresentationEntryKind.custom)))
  }

  return { findActiveSuggestions, findById, createCustom, findTypeAndOriginByUser, updateParamsByPresentationId }
}

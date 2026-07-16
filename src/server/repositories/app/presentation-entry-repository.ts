import { db, type DbClient } from "@/lib/drizzle"
import { PresentationEntryKind, PresentationEntryStatus, presentationEntry } from "@/lib/drizzle/schema/presentation-entry"
import { and, eq } from "drizzle-orm"

export type PresentationEntryInsert = typeof presentationEntry.$inferInsert

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

  return { findActiveSuggestions, findById, createCustom }
}

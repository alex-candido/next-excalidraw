import { db, type DbClient } from "@/lib/drizzle"
import { PresentationEntryKind, PresentationEntryStatus, presentationEntry } from "@/lib/drizzle/schema/presentation-entry"
import { and, eq, notInArray, sql } from "drizzle-orm"

export type PresentationEntryInsert = typeof presentationEntry.$inferInsert

export function presentationEntryRepository() {
  async function findRandomSuggestions(params: { type: number; language: number; limit: number; exclude?: string[] }) {
    const conditions = [
      eq(presentationEntry.kind, PresentationEntryKind.suggestion),
      eq(presentationEntry.status, PresentationEntryStatus.active),
      eq(presentationEntry.type, params.type),
      eq(presentationEntry.language, params.language),
    ]

    if (params.exclude?.length) conditions.push(notInArray(presentationEntry.id, params.exclude))

    return db
      .select()
      .from(presentationEntry)
      .where(and(...conditions))
      .orderBy(sql`random()`)
      .limit(params.limit)
  }

  async function findById(id: string) {
    return db.query.presentationEntry.findFirst({ where: eq(presentationEntry.id, id) }) ?? null
  }

  async function createCustom(data: PresentationEntryInsert, client: DbClient = db) {
    const [row] = await client.insert(presentationEntry).values(data).returning()
    return row
  }

  return { findRandomSuggestions, findById, createCustom }
}

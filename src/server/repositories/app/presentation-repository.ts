import { db, type DbClient } from "@/lib/drizzle"
import { presentation, PresentationStatus } from "@/lib/drizzle/schema/presentation"
import { presentationEntry, PresentationEntryKind } from "@/lib/drizzle/schema/presentation-entry"
import { outline, OutlineType } from "@/lib/drizzle/schema/outline"
import { slide } from "@/lib/drizzle/schema/slide"
import { and, desc, eq, lt } from "drizzle-orm"

export type PresentationInsert = typeof presentation.$inferInsert
export type PresentationUpdate = Partial<Pick<PresentationInsert, "title" | "status" | "slug">>

const ENTRY_COLUMNS = {
  id:          presentationEntry.id,
  type:        presentationEntry.type,
  language:    presentationEntry.language,
  prompt:      presentationEntry.prompt,
  aspectRatio: presentationEntry.aspectRatio,
  slideCount:  presentationEntry.slideCount,
  amount:      presentationEntry.amount,
  audience:    presentationEntry.audience,
  scenario:    presentationEntry.scenario,
  theme:       presentationEntry.theme,
  keywords:    presentationEntry.keywords,
}

// Join com a presentation_entry (kind=custom) associada — 1:1 garantido pelo
// unique em presentation_entry.presentation_id. Devolvido como `entry`
// aninhado (não achatado) pra não confundir de onde cada campo veio.
const ENTRY_JOIN = and(eq(presentationEntry.presentationId, presentation.id), eq(presentationEntry.kind, PresentationEntryKind.custom))

// Capa = outline type=cover (1 por presentation, por convenção) — join extra só
// pra listagem trazer a thumbnail já pronta, sem N+1 de "buscar slide de capa"
// por card.
const COVER_OUTLINE_JOIN = and(eq(outline.presentationId, presentation.id), eq(outline.type, OutlineType.cover))
const COVER_SLIDE_JOIN = eq(slide.outlineId, outline.id)

export function presentationRepository() {
  // Aceita `client` opcional (db ou tx) — quem cria a presentation junto de
  // uma presentation_entry (presentationService().create()) passa a `tx` de
  // uma transação, pra atomicidade; qualquer outro call site usa o default.
  async function create(data: PresentationInsert, client: DbClient = db) {
    const [row] = await client.insert(presentation).values(data).returning()
    return row
  }

  async function findById(id: string) {
    const [row] = await db
      .select({
        id:            presentation.id,
        code:          presentation.code,
        slug:          presentation.slug,
        userId:        presentation.userId,
        title:         presentation.title,
        systemPrompt:  presentation.systemPrompt,
        engine:        presentation.engine,
        visibility:    presentation.visibility,
        status:        presentation.status,
        viewsCount:    presentation.viewsCount,
        usage:         presentation.usage,
        createdAt:     presentation.createdAt,
        updatedAt:     presentation.updatedAt,
        entry:         ENTRY_COLUMNS,
        thumbnail:     slide.thumbnail,
      })
      .from(presentation)
      .leftJoin(presentationEntry, ENTRY_JOIN)
      .leftJoin(outline, COVER_OUTLINE_JOIN)
      .leftJoin(slide, COVER_SLIDE_JOIN)
      .where(eq(presentation.id, id))
      .limit(1)

    if (!row) return null

    // presentation sem entry é uma violação do invariante 1:1 garantido por
    // presentationService().create() (transação) — nunca deveria acontecer.
    // Falha alto e claro em vez de propagar `entry` nulo pros consumidores
    // (que leem entry.language/aspectRatio/etc como se fosse sempre presente).
    if (!row.entry) {
      throw Object.assign(new Error(`presentation ${id} sem presentation_entry associada (dado corrompido)`), { status: 500 })
    }

    return { ...row, entry: row.entry }
  }

  async function findMany(userId: string) {
    const rows = await db
      .select({
        id:            presentation.id,
        code:          presentation.code,
        slug:          presentation.slug,
        userId:        presentation.userId,
        title:         presentation.title,
        systemPrompt:  presentation.systemPrompt,
        engine:        presentation.engine,
        visibility:    presentation.visibility,
        status:        presentation.status,
        viewsCount:    presentation.viewsCount,
        usage:         presentation.usage,
        createdAt:     presentation.createdAt,
        updatedAt:     presentation.updatedAt,
        entry:         ENTRY_COLUMNS,
        thumbnail:     slide.thumbnail,
      })
      .from(presentation)
      .leftJoin(presentationEntry, ENTRY_JOIN)
      .leftJoin(outline, COVER_OUTLINE_JOIN)
      .leftJoin(slide, COVER_SLIDE_JOIN)
      .where(eq(presentation.userId, userId))
      .orderBy(desc(presentation.createdAt))

    // Mesmo invariante de findById, mas numa lista um item corrompido não deve
    // derrubar a listagem inteira — ignora só esse item, com aviso.
    return rows.flatMap((row) => {
      if (!row.entry) {
        console.warn(`[presentation] ${row.id} sem presentation_entry associada, ignorada da listagem`)
        return []
      }
      return [{ ...row, entry: row.entry }]
    })
  }

  async function update(id: string, data: PresentationUpdate) {
    const [row] = await db
      .update(presentation)
      .set(data)
      .where(eq(presentation.id, id))
      .returning()
    return row
  }

  async function remove(id: string) {
    await db.delete(presentation).where(eq(presentation.id, id))
  }

  // Sem escopo por userId de propósito — usado pelo job de retenção, que
  // varre a lixeira de todos os usuários, não de uma request autenticada.
  async function findTrashedBefore(cutoff: Date) {
    return db
      .select({ id: presentation.id, userId: presentation.userId })
      .from(presentation)
      .where(and(eq(presentation.status, PresentationStatus.trash), lt(presentation.updatedAt, cutoff)))
  }

  return { create, findById, findMany, update, remove, findTrashedBefore }
}

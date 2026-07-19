import { db, type DbClient } from "@/lib/drizzle"
import { presentation, PresentationStatus } from "@/lib/drizzle/schema/presentation"
import { presentationEntry, PresentationEntryKind } from "@/lib/drizzle/schema/presentation-entry"
import { presentationFavorite } from "@/lib/drizzle/schema/presentation-favorite"
import { outline, OutlineType } from "@/lib/drizzle/schema/outline"
import { slide } from "@/lib/drizzle/schema/slide"
import { and, desc, eq, gte, ilike, isNotNull, lt, ne, or, sql } from "drizzle-orm"

export type PresentationInsert = typeof presentation.$inferInsert
export type PresentationUpdate = Partial<Pick<PresentationInsert, "title" | "status" | "slug">>

const ENTRY_COLUMNS = {
  id:          presentationEntry.id,
  type:        presentationEntry.type,
  origin:      presentationEntry.origin,
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

// Join parametrizado por userId (não dá pra ser uma constante fixa como os
// acima) — só interessa se O PRÓPRIO usuário que está pedindo a lista
// favoritou, não se alguém favoritou.
function favoriteJoin(userId: string) {
  return and(eq(presentationFavorite.presentationId, presentation.id), eq(presentationFavorite.userId, userId))
}

const IS_FAVORITED_COLUMN = sql<boolean>`${presentationFavorite.id} is not null`

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
        isFavorited:   IS_FAVORITED_COLUMN,
      })
      .from(presentation)
      .leftJoin(presentationEntry, ENTRY_JOIN)
      .leftJoin(outline, COVER_OUTLINE_JOIN)
      .leftJoin(slide, COVER_SLIDE_JOIN)
      // Join pelo próprio dono (presentation.userId) — hoje quem acessa uma
      // presentation é sempre o dono (sem colaboração ainda), então "favoritado
      // pelo dono" e "favoritado por quem está vendo" são a mesma coisa. Revisar
      // quando presentation_member permitir outros usuários acessarem (Ciclo 5).
      .leftJoin(
        presentationFavorite,
        and(eq(presentationFavorite.presentationId, presentation.id), eq(presentationFavorite.userId, presentation.userId)),
      )
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
        isFavorited:   IS_FAVORITED_COLUMN,
      })
      .from(presentation)
      .leftJoin(presentationEntry, ENTRY_JOIN)
      .leftJoin(outline, COVER_OUTLINE_JOIN)
      .leftJoin(slide, COVER_SLIDE_JOIN)
      .leftJoin(presentationFavorite, favoriteJoin(userId))
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

  interface FindManyPaginatedParams {
    scope: "active" | "trash"
    type?: number
    visibility?: number
    recentSince?: Date
    favoritesOnly?: boolean
    search?: string
    cursor?: { createdAt: Date; id: string }
    limit: number
  }

  // Paginação por cursor (createdAt+id como desempate), não offset — evita
  // item repetido/pulado quando a lista muda (create/trash) entre uma página
  // e outra, ao custo de não dar pra pular direto pra "página N" (decisão
  // discutida com o usuário, 2026-07-17).
  async function findManyPaginated(userId: string, params: FindManyPaginatedParams) {
    const conditions = [
      eq(presentation.userId, userId),
      params.scope === "trash"
        ? eq(presentation.status, PresentationStatus.trash)
        : ne(presentation.status, PresentationStatus.trash),
    ]

    if (params.type !== undefined) conditions.push(eq(presentationEntry.type, params.type))
    if (params.visibility !== undefined) conditions.push(eq(presentation.visibility, params.visibility))
    if (params.recentSince) conditions.push(gte(presentation.createdAt, params.recentSince))
    // Mesmo LEFT JOIN que já traz `isFavorited` — filtrar por ele aqui vira um
    // INNER JOIN de fato pra essa tab, sem precisar de um join separado.
    if (params.favoritesOnly) conditions.push(isNotNull(presentationFavorite.id))
    if (params.search) conditions.push(ilike(presentation.title, `%${params.search}%`))

    if (params.cursor) {
      conditions.push(
        or(
          lt(presentation.createdAt, params.cursor.createdAt),
          and(eq(presentation.createdAt, params.cursor.createdAt), lt(presentation.id, params.cursor.id)),
        )!,
      )
    }

    // Busca 1 a mais que o limit só pra saber se tem próxima página, sem
    // precisar de um COUNT(*) separado.
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
        isFavorited:   IS_FAVORITED_COLUMN,
      })
      .from(presentation)
      .leftJoin(presentationEntry, ENTRY_JOIN)
      .leftJoin(outline, COVER_OUTLINE_JOIN)
      .leftJoin(slide, COVER_SLIDE_JOIN)
      .leftJoin(presentationFavorite, favoriteJoin(userId))
      .where(and(...conditions))
      .orderBy(desc(presentation.createdAt), desc(presentation.id))
      .limit(params.limit + 1)

    const hasMore = rows.length > params.limit
    const page = rows.slice(0, params.limit).flatMap((row) => {
      if (!row.entry) {
        console.warn(`[presentation] ${row.id} sem presentation_entry associada, ignorada da listagem`)
        return []
      }
      return [{ ...row, entry: row.entry }]
    })

    return { items: page, hasMore }
  }

  async function count(userId: string, status: number) {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(presentation)
      .where(and(eq(presentation.userId, userId), eq(presentation.status, status)))
    return row?.count ?? 0
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

  return { create, findById, findMany, findManyPaginated, count, update, remove, findTrashedBefore }
}

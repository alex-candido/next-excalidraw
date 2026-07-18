import { db } from "@/lib/drizzle"
import { presentationFavorite } from "@/lib/drizzle/schema/presentation-favorite"
import { presentation, PresentationStatus } from "@/lib/drizzle/schema/presentation"
import { and, eq, ne, sql } from "drizzle-orm"

export function presentationFavoriteRepository() {
  // onConflictDoNothing — clique duplo/corrida não deve estourar o unique
  // (presentation_id, user_id), só é um no-op (já está favoritado).
  async function create(presentationId: string, userId: string) {
    await db
      .insert(presentationFavorite)
      .values({ presentationId, userId })
      .onConflictDoNothing()
  }

  async function remove(presentationId: string, userId: string) {
    await db
      .delete(presentationFavorite)
      .where(and(eq(presentationFavorite.presentationId, presentationId), eq(presentationFavorite.userId, userId)))
  }

  // Só conta favoritos de presentations ativas — a tab "Favoritas" nunca
  // mostra uma presentation na lixeira (mesmo escopo "active" que o list()
  // usa pra qualquer tab exceto "trash"), o badge precisa bater com isso.
  async function count(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(presentationFavorite)
      .innerJoin(presentation, eq(presentationFavorite.presentationId, presentation.id))
      .where(and(eq(presentationFavorite.userId, userId), ne(presentation.status, PresentationStatus.trash)))
    return row?.count ?? 0
  }

  return { create, remove, count }
}

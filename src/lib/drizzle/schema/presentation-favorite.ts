// == Schema Information
//
// Table: presentation_favorite
//
//  id                          :uuid              primary key, default(fn())
//  presentation_id             :uuid              not null
//  user_id                     :text              not null
//  created_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  presentation_favorite_presentationId_idx  (presentation_id)
//
// Foreign Keys
//
//  presentation_favorite.presentation_id => presentation.id
//  presentation_favorite.user_id => user.id
//

import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { presentation } from "./presentation";
import { user } from "./user";

// Modelo "like" de rede social — favoritar insere uma linha, desfavoritar
// deleta a linha. Por-usuário desde já (não boolean solto em `presentation`)
// pra não precisar redesenhar quando existir colaboração/múltiplos usuários
// vendo a mesma presentation (ver pm/decisions.md, 2026-07-17).
export const presentationFavorite = pgTable(
  "presentation_favorite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("presentation_favorite_unique").on(table.presentationId, table.userId),
    index("presentation_favorite_presentationId_idx").on(table.presentationId),
  ],
);

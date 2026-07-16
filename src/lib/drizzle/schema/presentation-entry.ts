// == Schema Information
//
// Table: presentation_entry
//
//  id                          :uuid              primary key, default(fn())
//  kind                        :smallint          not null
//  presentation_id             :uuid              unique
//  source_suggestion_id        :uuid
//  type                        :smallint          not null
//  language                    :smallint          not null
//  icon                        :text
//  title                       :text
//  description                 :text
//  prompt                      :text              not null
//  aspect_ratio                :smallint          not null
//  slide_count                 :smallint          not null
//  amount                      :smallint          not null
//  audience                    :smallint          not null
//  scenario                    :smallint          not null
//  theme                       :smallint          not null
//  keywords                    :text[]
//  status                      :smallint          default(0), not null
//  created_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  presentation_entry_kind_idx  (kind, type, language, status)
//
// Foreign Keys
//
//  presentation_entry.presentation_id => presentation.id
//  presentation_entry.source_suggestion_id => presentation_entry.id (self)
//

import { AnyPgColumn, index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { presentation } from "./presentation";

// suggestion: conteúdo curado, subido via seed (drizzle/data/), exibido como card
// no /app/start — nunca gerado dinamicamente, zero custo de IA pra listar/exibir.
// presentation_id sempre null aqui (reusável, não amarrado a 1 presentation).
//
// custom: registrado SEMPRE que uma presentation é criada (usuário digitou do
// zero OU clicou numa suggestion sem editar — os dois casos geram uma linha
// nova aqui, nunca reaproveitam a de kind=suggestion diretamente). 1:1 com a
// presentation (presentation_id preenchido e único). source_suggestion_id
// aponta pra qual suggestion originou essa entry (null se foi 100% manual) —
// existe só pra métrica de "quais suggestions são mais usadas".
export const PresentationEntryKind = {
  suggestion: 0,
  custom: 1,
} as const;

export const PresentationEntryStatus = {
  active: 0,
  inactive: 1,
} as const;

export const presentationEntry = pgTable(
  "presentation_entry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: smallint("kind").notNull(),
    // Único mas nullable — Postgres permite múltiplos NULL num UNIQUE (todas as
    // linhas kind=suggestion), só barra duplicar presentation_id de verdade
    // (garante o 1:1 das linhas kind=custom).
    presentationId: uuid("presentation_id")
      .unique()
      .references(() => presentation.id, { onDelete: "cascade" }),
    // Auto-referência — só kind=custom preenche, apontando pra linha
    // kind=suggestion que originou (métrica de popularidade).
    sourceSuggestionId: uuid("source_suggestion_id").references((): AnyPgColumn => presentationEntry.id),
    type: smallint("type").notNull(),
    language: smallint("language").notNull(),
    // Código semântico (ex: "chart"), não o glyph — app converte via icon-map
    // (react-icons/fc), trocável sem tocar no dado. Só kind=suggestion.
    icon: text("icon"),
    title: text("title"),
    description: text("description"),
    prompt: text("prompt").notNull(),
    aspectRatio: smallint("aspect_ratio").notNull(),
    slideCount: smallint("slide_count").notNull(),
    amount: smallint("amount").notNull(),
    audience: smallint("audience").notNull(),
    scenario: smallint("scenario").notNull(),
    theme: smallint("theme").notNull(),
    keywords: text("keywords").array(),
    status: smallint("status").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("presentation_entry_kind_idx").on(table.kind, table.type, table.language, table.status)],
);

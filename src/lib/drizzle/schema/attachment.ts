// == Schema Information
//
// Table: attachment (UNLOGGED — efêmero, só existe até a geração consumir)
//
//  id                          :uuid              primary key, default(fn())
//  presentation_id             :uuid              not null
//  type                        :smallint          not null
//  name                        :text              not null
//  content                     :bytea
//  url                         :text
//  mime_type                   :text
//  size                        :integer
//  created_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  attachment_presentationId_idx  (presentation_id)
//
// Foreign Keys
//
//  attachment.presentation_id => presentation.id
//

import { customType, index, integer, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { presentation } from "./presentation";

export const AttachmentType = {
  image: 0,
  file: 1,
  link: 2,
} as const;

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

// Anexo (imagem/arquivo/link) do form de criação (/app/start) — material de
// referência lido UMA VEZ durante a geração, não servido repetidamente. Por isso
// fica no Postgres (UNLOGGED, mais rápido em escrita, sem garantia de durabilidade
// que não precisamos) em vez de object storage (R2) — ver docs/sdd/1-product/pm/decisions.md.
export const attachment = pgTable(
  "attachment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentation.id, { onDelete: "cascade" }),
    type: smallint("type").notNull(),
    name: text("name").notNull(),
    content: bytea("content"),
    url: text("url"),
    mimeType: text("mime_type"),
    size: integer("size"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("attachment_presentationId_idx").on(table.presentationId)],
);

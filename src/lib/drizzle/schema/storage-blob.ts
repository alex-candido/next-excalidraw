// == Schema Information
//
// Table: storage_blob
//
//  id                          :uuid              primary key, default(fn())
//  storage_key                 :text              not null, unique
//  filename                    :text              not null
//  mime_type                   :text              not null
//  size                        :integer           not null
//  checksum                    :text
//  created_at                  :timestamp         default(fn()), not null
//

import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// O objeto em si, armazenado no R2 — não sabe a quem pertence (isso é
// storage-attachment.ts). Padrão inspirado no Active Storage do Rails
// (blob + attachment polimórfico) — ver docs/sdd/1-product/pm/decisions.md.
// Ainda sem consumidor (thumbnail de slide/imagem embutida do Studio ainda
// não geram blob de verdade) — schema pronto pra quando isso for implementado.
export const storageBlob = pgTable("storage_blob", {
  id: uuid("id").primaryKey().defaultRandom(),
  storageKey: text("storage_key").notNull().unique(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  checksum: text("checksum"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// == Schema Information
//
// Table: storage_attachment
//
//  id                          :uuid              primary key, default(fn())
//  blob_id                     :uuid              not null
//  record_type                 :smallint          not null
//  record_id                   :uuid              not null
//  name                        :text              not null
//  created_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  storage_attachment_blobId_idx  (blob_id)
//  storage_attachment_record_idx  (record_type, record_id, name)
//
// Foreign Keys
//
//  storage_attachment.blob_id => storage_blob.id
//

import { index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { storageBlob } from "./storage-blob";

// Ligação polimórfica: qual entidade usa qual blob, e com que papel ("thumbnail",
// "embedded_image", "avatar"...). Não precisa de tabela nova por tipo de asset —
// ver docs/sdd/1-product/pm/decisions.md.
export const StorageRecordType = {
  presentation: 0,
  slide: 1,
  user: 2,
} as const;

export const storageAttachment = pgTable(
  "storage_attachment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    blobId: uuid("blob_id")
      .notNull()
      .references(() => storageBlob.id, { onDelete: "cascade" }),
    recordType: smallint("record_type").notNull(),
    recordId: uuid("record_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("storage_attachment_blobId_idx").on(table.blobId),
    index("storage_attachment_record_idx").on(table.recordType, table.recordId, table.name),
  ],
);

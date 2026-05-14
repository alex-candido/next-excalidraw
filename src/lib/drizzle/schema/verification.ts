// == Schema Information
//
// Table: verification
//
//  id                          :text              primary key
//  identifier                  :text              not null
//  value                       :text              not null
//  expires_at                  :timestamp         not null
//  created_at                  :timestamp         default(fn()), not null
//  updated_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  verification_identifier_idx  (identifier)
//

import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

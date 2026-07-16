// == Schema Information
//
// Table: cache (UNLOGGED)
//
//  key         :text        primary key
//  value       :jsonb       not null
//  expires_at  :timestamptz not null
//

import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const cache = pgTable("cache", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

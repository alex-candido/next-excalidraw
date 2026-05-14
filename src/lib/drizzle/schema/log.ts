// == Schema Information
//
// Table: log
//
//  id                          :uuid              primary key, default(fn())
//  user_id                     :text
//  generation_id               :uuid              not null
//  level                       :smallint          not null
//  message                     :text              not null
//  context                     :jsonb
//  created_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  log_generationId_idx  (generation_id)
//
// Foreign Keys
//
//  log.user_id => user.id
//  log.generation_id => generation.id
//

import { index, jsonb, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { generation } from "./generation";
import { user } from "./user";

export const LogLevel = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

export const log = pgTable(
  "log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    generationId: uuid("generation_id")
      .notNull()
      .references(() => generation.id, { onDelete: "cascade" }),
    level: smallint("level").notNull(),
    message: text("message").notNull(),
    context: jsonb("context"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("log_generationId_idx").on(table.generationId)],
);

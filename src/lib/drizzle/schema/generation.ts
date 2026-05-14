// == Schema Information
//
// Table: generation
//
//  id                          :uuid              primary key, default(fn())
//  presentation_id             :uuid              not null
//  type                        :smallint          not null
//  status                      :smallint          default(0), not null
//  framework                   :jsonb
//  usage                       :jsonb
//  model                       :jsonb
//  context                     :jsonb
//  info                        :jsonb
//  started_at                  :timestamp
//  completed_at                :timestamp
//  created_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  generation_presentationId_idx  (presentation_id)
//
// Foreign Keys
//
//  generation.presentation_id => presentation.id
//

import { index, jsonb, pgTable, smallint, timestamp, uuid } from "drizzle-orm/pg-core";
import { presentation } from "./presentation";

export const GenerationType = {
  outline: 0,
  slide: 1,
} as const;

export const GenerationStatus = {
  pending: 0,
  running: 1,
  completed: 2,
  failed: 3,
} as const;

export const generation = pgTable(
  "generation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentation.id, { onDelete: "cascade" }),
    type: smallint("type").notNull(),
    status: smallint("status").default(0).notNull(),
    framework: jsonb("framework"),
    usage: jsonb("usage"),
    model: jsonb("model"),
    context: jsonb("context"),
    info: jsonb("info"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("generation_presentationId_idx").on(table.presentationId)],
);

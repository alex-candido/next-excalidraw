// == Schema Information
//
// Table: outline
//
//  id                          :uuid              primary key, default(fn())
//  presentation_id             :uuid              not null
//  order                       :smallint          not null
//  type                        :smallint          not null
//  title                       :text              not null
//  description                 :text
//  concepts                    :text[]
//  representation              :smallint          default(0), not null
//  layout                      :smallint          default(0), not null
//  score                       :real
//  created_at                  :timestamp         default(fn()), not null
//  updated_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  outline_presentationId_idx  (presentation_id)
//
// Foreign Keys
//
//  outline.presentation_id => presentation.id
//

import { index, pgTable, real, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { presentation } from "./presentation";

export const OutlineType = {
  cover: 0,
  agenda: 1,
  content: 2,
  summary: 3,
  closing: 4,
} as const;

export const OutlineRepresentation = {
  auto: 0,
  flowchart: 1,
  mindmap: 2,
  orgchart: 3,
  sequence: 4,
  class: 5,
  er: 6,
  gantt: 7,
  timeline: 8,
  tree: 9,
  network: 10,
  architecture: 11,
  dataflow: 12,
  state: 13,
  swimlane: 14,
  fishbone: 15,
  pyramid: 16,
  venn: 17,
  matrix: 18,
  funnel: 19,
  infographic: 20,
} as const;

export const OutlineLayout = {
  auto: 0,
  title_only: 1,
  title_content: 2,
  two_column: 3,
  image_text: 4,
  full_image: 5,
  bullets: 6,
  blank: 7,
} as const;

export const outline = pgTable(
  "outline",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentation.id, { onDelete: "cascade" }),
    order: smallint("order").notNull(),
    type: smallint("type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    concepts: text("concepts").array(),
    representation: smallint("representation").default(0).notNull(),
    layout: smallint("layout").default(0).notNull(),
    score: real("score"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("outline_presentationId_idx").on(table.presentationId)],
);

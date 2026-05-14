// == Schema Information
//
// Table: slide
//
//  id                          :uuid              primary key, default(fn())
//  presentation_id             :uuid              not null
//  outline_id                  :uuid              not null
//  order                       :smallint          not null
//  elements                    :jsonb
//  app_state                   :jsonb
//  files                       :jsonb
//  thumbnail                   :text
//  status                      :smallint          default(0), not null
//  created_at                  :timestamp         default(fn()), not null
//  updated_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  slide_presentationId_idx  (presentation_id)
//  slide_outlineId_idx  (outline_id)
//
// Foreign Keys
//
//  slide.presentation_id => presentation.id
//  slide.outline_id => outline.id
//

import { index, jsonb, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { outline } from "./outline";
import { presentation } from "./presentation";

export const SlideStatus = {
  active: 0,
  inactive: 1,
  trash: 2,
} as const;

export const slide = pgTable(
  "slide",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentation.id, { onDelete: "cascade" }),
    outlineId: uuid("outline_id")
      .notNull()
      .references(() => outline.id, { onDelete: "cascade" }),
    order: smallint("order").notNull(),
    elements: jsonb("elements"),
    appState: jsonb("app_state"),
    files: jsonb("files"),
    thumbnail: text("thumbnail"),
    status: smallint("status").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("slide_presentationId_idx").on(table.presentationId),
    index("slide_outlineId_idx").on(table.outlineId),
  ],
);

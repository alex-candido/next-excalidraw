// == Schema Information
//
// Table: permission
//
//  id                          :uuid              primary key, default(fn())
//  key                         :text              not null, unique
//  description                 :text
//  created_at                  :timestamp         default(fn()), not null
//

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const permission = pgTable("permission", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

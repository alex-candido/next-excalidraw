// == Schema Information
//
// Table: group
//
//  id                          :uuid              primary key, default(fn())
//  name                        :text              not null, unique
//  description                 :text
//  created_by                  :text
//  created_at                  :timestamp         default(fn()), not null
//
// Foreign Keys
//
//  group.created_by => user.id
//

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

export const group = pgTable("group", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

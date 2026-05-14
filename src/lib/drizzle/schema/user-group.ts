// == Schema Information
//
// Table: user_group
//
//  id                          :uuid              primary key, default(fn())
//  user_id                     :text              not null
//  group_id                    :uuid              not null
//  assigned_by                 :text
//  created_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  user_group_userId_idx  (user_id)
//
// Foreign Keys
//
//  user_group.user_id => user.id
//  user_group.group_id => group.id
//  user_group.assigned_by => user.id
//

import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { group } from "./group";
import { user } from "./user";

export const userGroup = pgTable(
  "user_group",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    assignedBy: text("assigned_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("user_group_unique").on(table.userId, table.groupId),
    index("user_group_userId_idx").on(table.userId),
  ],
);

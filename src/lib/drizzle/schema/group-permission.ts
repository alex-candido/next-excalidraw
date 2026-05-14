// == Schema Information
//
// Table: group_permission
//
//  id                          :uuid              primary key, default(fn())
//  group_id                    :uuid              not null
//  permission_id               :uuid              not null
//  assigned_by                 :text
//
// Foreign Keys
//
//  group_permission.group_id => group.id
//  group_permission.permission_id => permission.id
//  group_permission.assigned_by => user.id
//

import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { group } from "./group";
import { permission } from "./permission";
import { user } from "./user";

export const groupPermission = pgTable(
  "group_permission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
    assignedBy: text("assigned_by").references(() => user.id, { onDelete: "set null" }),
  },
  (table) => [
    unique("group_permission_unique").on(table.groupId, table.permissionId),
  ],
);

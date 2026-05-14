// == Schema Information
//
// Table: user_permission
//
//  id                          :uuid              primary key, default(fn())
//  user_id                     :text              not null
//  permission_id               :uuid              not null
//  type                        :smallint          not null
//
// Indexes
//
//  user_permission_userId_idx  (user_id)
//
// Foreign Keys
//
//  user_permission.user_id => user.id
//  user_permission.permission_id => permission.id
//

import { index, pgTable, smallint, text, unique, uuid } from "drizzle-orm/pg-core";
import { permission } from "./permission";
import { user } from "./user";

export const PermissionType = {
  grant: 0,
  deny: 1,
} as const;

export type PermissionTypeKey = keyof typeof PermissionType;
export type PermissionTypeValue = (typeof PermissionType)[PermissionTypeKey];

export const userPermission = pgTable(
  "user_permission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
    type: smallint("type").notNull(),
  },
  (table) => [
    unique("user_permission_unique").on(table.userId, table.permissionId),
    index("user_permission_userId_idx").on(table.userId),
  ],
);

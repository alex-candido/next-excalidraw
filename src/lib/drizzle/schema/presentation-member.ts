// == Schema Information
//
// Table: presentation_member
//
//  id                          :uuid              primary key, default(fn())
//  presentation_id             :uuid              not null
//  user_id                     :text              not null
//  invited_by                  :text
//  role                        :smallint          default(0), not null
//  created_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  presentation_member_presentationId_idx  (presentation_id)
//
// Foreign Keys
//
//  presentation_member.presentation_id => presentation.id
//  presentation_member.user_id => user.id
//  presentation_member.invited_by => user.id
//

import { index, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { presentation } from "./presentation";
import { user } from "./user";

export const MemberRole = {
  viewer: 0,
  editor: 1,
} as const;

export const presentationMember = pgTable(
  "presentation_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    invitedBy: text("invited_by").references(() => user.id, { onDelete: "set null" }),
    role: smallint("role").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("presentation_member_presentationId_idx").on(table.presentationId)],
);

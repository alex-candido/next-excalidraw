// == Schema Information
//
// Table: session
//
//  id                          :text              primary key
//  expires_at                  :timestamp         not null
//  token                       :text              not null, unique
//  created_at                  :timestamp         default(fn()), not null
//  updated_at                  :timestamp         not null
//  ip_address                  :text
//  user_agent                  :text
//  user_id                     :text              not null
//
// Indexes
//
//  session_userId_idx  (user_id)
//
// Foreign Keys
//
//  session.user_id => user.id
//

import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

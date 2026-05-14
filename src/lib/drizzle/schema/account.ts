// == Schema Information
//
// Table: account
//
//  id                          :text              primary key
//  account_id                  :text              not null
//  provider_id                 :text              not null
//  user_id                     :text              not null
//  access_token                :text
//  refresh_token               :text
//  id_token                    :text
//  access_token_expires_at     :timestamp
//  refresh_token_expires_at    :timestamp
//  scope                       :text
//  password                    :text
//  created_at                  :timestamp         default(fn()), not null
//  updated_at                  :timestamp         not null
//
// Indexes
//
//  account_userId_idx  (user_id)
//
// Foreign Keys
//
//  account.user_id => user.id
//

import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

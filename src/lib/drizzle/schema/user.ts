// == Schema Information
//
// Table: user
//
//  id                          :text              primary key
//  name                        :text              not null
//  email                       :text              not null, unique
//  email_verified              :boolean           default(false), not null
//  image                       :text
//  created_at                  :timestamp         default(fn()), not null
//  updated_at                  :timestamp         default(fn()), not null
//

import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

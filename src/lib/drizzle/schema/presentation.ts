// == Schema Information
//
// Table: presentation
//
//  id                          :uuid              primary key, default(fn())
//  code                        :text              not null, unique
//  slug                        :text              not null, unique
//  user_id                     :text              not null
//  type                        :smallint          default(1), not null
//  title                       :text              not null
//  user_prompt                 :text
//  system_prompt               :text
//  language                    :smallint          default(0), not null
//  aspect_ratio                :smallint          default(0), not null
//  slide_count                 :smallint          default(0), not null
//  amount                      :smallint          default(0), not null
//  audience                    :smallint          default(0), not null
//  scenario                    :smallint          default(0), not null
//  theme                       :smallint          default(0), not null
//  keywords                    :text[]
//  visibility                  :smallint          default(1), not null
//  status                      :smallint          default(0), not null
//  views_count                 :integer           default(0), not null
//  usage                       :jsonb
//  created_at                  :timestamp         default(fn()), not null
//  updated_at                  :timestamp         default(fn()), not null
//
// Indexes
//
//  presentation_userId_idx  (user_id)
//
// Foreign Keys
//
//  presentation.user_id => user.id
//

import { index, integer, jsonb, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

export const PresentationStatus = {
  draft: 0,
  active: 1,
  inactive: 2,
  trash: 3,
} as const;

export const PresentationVisibility = {
  public: 0,
  private: 1,
} as const;

export const PresentationLanguage = {
  en: 0,
  es: 1,
  fr: 2,
  de: 3,
  it: 4,
  ptBR: 5,
  ru: 6,
  zh: 7,
  ja: 8,
  ko: 9,
} as const;

export const AspectRatio = {
  "16:9": 0,
  "4:3": 1,
  "9:16": 2,
  "1:1": 3,
  A4: 4,
  custom: 5,
} as const;

export const PresentationType = {
  single: 0,
  multi: 1,
} as const;

export const PresentationAmount = {
  auto:      0,
  minimal:   1,
  concise:   2,
  detailed:  3,
  extensive: 4,
} as const;

export const PresentationAudience = {
  general:  0,
  business: 1,
  investor: 2,
  teacher:  3,
  student:  4,
} as const;

export const PresentationScenario = {
  auto:        0,
  promotional: 1,
  teaching:    2,
  analytical:  3,
  report:      4,
} as const;

export const PresentationTheme = {
  daktilo:    0,
  noir:       1,
  cornflower: 2,
  indigo:     3,
  orbit:      4,
  cosmos:     5,
  sunset:     6,
  forest:     7,
  piano:      8,
  ebony:      9,
} as const;

export const presentation = pgTable(
  "presentation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    slug: text("slug").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: smallint("type").default(1).notNull(),
    title: text("title").notNull(),
    userPrompt: text("user_prompt"),
    systemPrompt: text("system_prompt"),
    language: smallint("language").default(0).notNull(),
    aspectRatio: smallint("aspect_ratio").default(0).notNull(),
    slideCount: smallint("slide_count").default(0).notNull(),
    amount:     smallint("amount").default(0).notNull(),
    audience:   smallint("audience").default(0).notNull(),
    scenario:   smallint("scenario").default(0).notNull(),
    theme:      smallint("theme").default(0).notNull(),
    keywords: text("keywords").array(),
    visibility: smallint("visibility").default(1).notNull(),
    status: smallint("status").default(0).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    usage: jsonb("usage"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("presentation_userId_idx").on(table.userId)],
);

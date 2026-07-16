// == Schema Information
//
// Table: presentation
//
//  id                          :uuid              primary key, default(fn())
//  code                        :text              not null, unique
//  slug                        :text              not null, unique
//  user_id                     :text              not null
//  title                       :text              not null
//  system_prompt               :text
//  engine                      :smallint          default(0), not null
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
// Nota: type/language/aspectRatio/slideCount/amount/audience/scenario/theme/
// keywords/userPrompt saíram daqui — são parâmetros de geração, não da
// presentation em si, e ficam em presentation_entry (kind=custom, 1:1 via
// presentation_id) pra não duplicar dado. Ver docs/sdd/1-product/pm/decisions.md.
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

// Enums abaixo descrevem valores de presentation_entry (type/language/aspectRatio/
// amount/audience/scenario/theme) — mantidos aqui só pra não quebrar as dezenas
// de imports já existentes; a coluna de verdade vive em presentation-entry.ts.
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

// 1 engine por presentation inteira. Só `excalidraw` implementada por ora —
// campo existe pra não fechar a porta de engine plugável, sem UI de seleção
// ainda (ver docs/sdd/1-product/pm/decisions.md).
export const PresentationEngine = {
  excalidraw: 0,
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
    title: text("title").notNull(),
    systemPrompt: text("system_prompt"),
    engine: smallint("engine").default(0).notNull(),
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

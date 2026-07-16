import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { presentationEntry, PresentationEntryKind } from "../schema/presentation-entry";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

interface PresentationSuggestionRow {
  id: string;
  type: string;
  language: string;
  icon: string;
  title: string;
  description: string;
  prompt: string;
  aspectRatio: string;
  slideCount: string;
  amount: string;
  audience: string;
  scenario: string;
  theme: string;
  status: string;
}

export async function seedPresentationEntries() {
  const csv = readFileSync(join(import.meta.dir, "../data/presentation-entries.csv"), "utf-8");
  const records: PresentationSuggestionRow[] = parse(csv, { columns: true, skip_empty_lines: true });

  const rows = records.map((r) => ({
    id: r.id,
    kind: PresentationEntryKind.suggestion,
    presentationId: null,
    type: Number(r.type),
    language: Number(r.language),
    icon: r.icon,
    title: r.title,
    description: r.description,
    prompt: r.prompt,
    aspectRatio: Number(r.aspectRatio),
    slideCount: Number(r.slideCount),
    amount: Number(r.amount),
    audience: Number(r.audience),
    scenario: Number(r.scenario),
    theme: Number(r.theme),
    status: Number(r.status),
  }));

  await db.insert(presentationEntry).values(rows).onConflictDoNothing();

  console.log(`  ✓ presentation_entry (${rows.length} suggestions)`);
  await client.end();
}

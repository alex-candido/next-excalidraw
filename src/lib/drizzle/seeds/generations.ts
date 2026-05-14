import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { GenerationStatus, GenerationType, generation } from "../schema/generation";
import { PRESENTATION_ID } from "./presentations";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const GENERATION_ID = {
  p1_outline: "00000008-0000-4000-8000-000000000001",
  p1_slide:   "00000008-0000-4000-8000-000000000002",
  p2_outline: "00000008-0000-4000-8000-000000000003",
  p2_slide:   "00000008-0000-4000-8000-000000000004",
  p3_outline: "00000008-0000-4000-8000-000000000005",
  p3_slide:   "00000008-0000-4000-8000-000000000006",
} as const;

export const GENERATIONS = [
  { id: GENERATION_ID.p1_outline, presentationId: PRESENTATION_ID.p1, type: GenerationType.outline, status: GenerationStatus.completed },
  { id: GENERATION_ID.p1_slide,   presentationId: PRESENTATION_ID.p1, type: GenerationType.slide,   status: GenerationStatus.completed },
  { id: GENERATION_ID.p2_outline, presentationId: PRESENTATION_ID.p2, type: GenerationType.outline, status: GenerationStatus.completed },
  { id: GENERATION_ID.p2_slide,   presentationId: PRESENTATION_ID.p2, type: GenerationType.slide,   status: GenerationStatus.completed },
  { id: GENERATION_ID.p3_outline, presentationId: PRESENTATION_ID.p3, type: GenerationType.outline, status: GenerationStatus.completed },
  { id: GENERATION_ID.p3_slide,   presentationId: PRESENTATION_ID.p3, type: GenerationType.slide,   status: GenerationStatus.running  },
] as const;

export async function seedGenerations() {
  await db.insert(generation).values([...GENERATIONS]).onConflictDoNothing();
  console.log("  ✓ generations");
  await client.end();
}

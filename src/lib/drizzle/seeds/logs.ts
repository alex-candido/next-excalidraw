import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { LogLevel, log } from "../schema/log";
import { GENERATION_ID } from "./generations";
import { USER_ID } from "./users";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const LOGS = [
  // p1 outline generation
  { id: "00000009-0000-4000-8000-000000000001", userId: USER_ID.member01, generationId: GENERATION_ID.p1_outline, level: LogLevel.info,  message: "Outline generation started" },
  { id: "00000009-0000-4000-8000-000000000002", userId: USER_ID.member01, generationId: GENERATION_ID.p1_outline, level: LogLevel.info,  message: "Outline generated successfully with 5 slides" },
  { id: "00000009-0000-4000-8000-000000000003", userId: USER_ID.member01, generationId: GENERATION_ID.p1_outline, level: LogLevel.info,  message: "Semantic scoring completed. Avg score: 0.91" },
  // p1 slide generation
  { id: "00000009-0000-4000-8000-000000000004", userId: USER_ID.member01, generationId: GENERATION_ID.p1_slide,   level: LogLevel.info,  message: "Slide generation started for 5 outlines" },
  { id: "00000009-0000-4000-8000-000000000005", userId: USER_ID.member01, generationId: GENERATION_ID.p1_slide,   level: LogLevel.info,  message: "All slides generated successfully" },
  { id: "00000009-0000-4000-8000-000000000006", userId: USER_ID.member01, generationId: GENERATION_ID.p1_slide,   level: LogLevel.info,  message: "Thumbnails generated" },
  // p2 outline generation
  { id: "00000009-0000-4000-8000-000000000007", userId: USER_ID.member01, generationId: GENERATION_ID.p2_outline, level: LogLevel.info,  message: "Outline generation started" },
  { id: "00000009-0000-4000-8000-000000000008", userId: USER_ID.member01, generationId: GENERATION_ID.p2_outline, level: LogLevel.info,  message: "Outline generated successfully with 5 slides" },
  { id: "00000009-0000-4000-8000-000000000009", userId: USER_ID.member01, generationId: GENERATION_ID.p2_outline, level: LogLevel.info,  message: "Semantic scoring completed. Avg score: 0.92" },
  // p3 outline generation
  { id: "00000009-0000-4000-8000-000000000010", userId: USER_ID.member02, generationId: GENERATION_ID.p3_outline, level: LogLevel.info,  message: "Outline generation started" },
  { id: "00000009-0000-4000-8000-000000000011", userId: USER_ID.member02, generationId: GENERATION_ID.p3_outline, level: LogLevel.info,  message: "Outline generated successfully with 5 slides" },
  { id: "00000009-0000-4000-8000-000000000012", userId: USER_ID.member02, generationId: GENERATION_ID.p3_outline, level: LogLevel.info,  message: "Semantic scoring completed. Avg score: 0.87" },
  // p3 slide generation (still running)
  { id: "00000009-0000-4000-8000-000000000013", userId: USER_ID.member02, generationId: GENERATION_ID.p3_slide,   level: LogLevel.info,  message: "Slide generation started for 5 outlines" },
  { id: "00000009-0000-4000-8000-000000000014", userId: USER_ID.member02, generationId: GENERATION_ID.p3_slide,   level: LogLevel.info,  message: "Generating slide 3/5..." },
  { id: "00000009-0000-4000-8000-000000000015", userId: USER_ID.member02, generationId: GENERATION_ID.p3_slide,   level: LogLevel.warn,  message: "Retrying slide 3 due to timeout" },
] as const;

export async function seedLogs() {
  await db.insert(log).values([...LOGS]).onConflictDoNothing();
  console.log("  ✓ logs");
  await client.end();
}

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { SlideStatus, slide } from "../schema/slide";
import { OUTLINE_ID } from "./outlines";
import { PRESENTATION_ID } from "./presentations";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const SLIDES = [
  { id: "00000007-0000-4000-8000-000000000001", presentationId: PRESENTATION_ID.p1, outlineId: OUTLINE_ID.p1_cover,    order: 0, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000002", presentationId: PRESENTATION_ID.p1, outlineId: OUTLINE_ID.p1_agenda,   order: 1, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000003", presentationId: PRESENTATION_ID.p1, outlineId: OUTLINE_ID.p1_content1, order: 2, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000004", presentationId: PRESENTATION_ID.p1, outlineId: OUTLINE_ID.p1_content2, order: 3, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000005", presentationId: PRESENTATION_ID.p1, outlineId: OUTLINE_ID.p1_closing,  order: 4, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000006", presentationId: PRESENTATION_ID.p2, outlineId: OUTLINE_ID.p2_cover,    order: 0, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000007", presentationId: PRESENTATION_ID.p2, outlineId: OUTLINE_ID.p2_agenda,   order: 1, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000008", presentationId: PRESENTATION_ID.p2, outlineId: OUTLINE_ID.p2_content1, order: 2, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000009", presentationId: PRESENTATION_ID.p2, outlineId: OUTLINE_ID.p2_content2, order: 3, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000010", presentationId: PRESENTATION_ID.p2, outlineId: OUTLINE_ID.p2_closing,  order: 4, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000011", presentationId: PRESENTATION_ID.p3, outlineId: OUTLINE_ID.p3_cover,    order: 0, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000012", presentationId: PRESENTATION_ID.p3, outlineId: OUTLINE_ID.p3_agenda,   order: 1, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000013", presentationId: PRESENTATION_ID.p3, outlineId: OUTLINE_ID.p3_content1, order: 2, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000014", presentationId: PRESENTATION_ID.p3, outlineId: OUTLINE_ID.p3_content2, order: 3, status: SlideStatus.active },
  { id: "00000007-0000-4000-8000-000000000015", presentationId: PRESENTATION_ID.p3, outlineId: OUTLINE_ID.p3_closing,  order: 4, status: SlideStatus.active },
] as const;

export async function seedSlides() {
  await db.insert(slide).values([...SLIDES]).onConflictDoNothing();
  console.log("  ✓ slides");
  await client.end();
}

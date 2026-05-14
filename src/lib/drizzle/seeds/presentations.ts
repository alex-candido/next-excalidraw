import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { PresentationStatus, PresentationVisibility, presentation } from "../schema/presentation";
import { USER_ID } from "./users";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const PRESENTATION_ID = {
  p1: "00000005-0000-4000-8000-000000000001",
  p2: "00000005-0000-4000-8000-000000000002",
  p3: "00000005-0000-4000-8000-000000000003",
} as const;

export const PRESENTATIONS: {
  id: string; code: string; slug: string; userId: string; title: string;
  userPrompt: string; language: number; aspectRatio: number; slideCount: number;
  keywords: string[]; visibility: number; status: number; viewsCount: number;
}[] = [
  {
    id: PRESENTATION_ID.p1,
    code: "PRES001",
    slug: "future-of-ai-healthcare",
    userId: USER_ID.member01,
    title: "The Future of AI in Healthcare",
    userPrompt: "Create a presentation about how AI is transforming healthcare",
    language: 0, aspectRatio: 0, slideCount: 5,
    keywords: ["AI", "healthcare", "technology", "innovation"],
    visibility: PresentationVisibility.public,
    status: PresentationStatus.active,
    viewsCount: 124,
  },
  {
    id: PRESENTATION_ID.p2,
    code: "PRES002",
    slug: "startup-pitch-deck-2025",
    userId: USER_ID.member01,
    title: "Startup Pitch Deck 2025",
    userPrompt: "Create a pitch deck for an AI startup focused on education",
    language: 0, aspectRatio: 0, slideCount: 5,
    keywords: ["startup", "pitch", "education", "AI"],
    visibility: PresentationVisibility.private,
    status: PresentationStatus.active,
    viewsCount: 0,
  },
  {
    id: PRESENTATION_ID.p3,
    code: "PRES003",
    slug: "climate-change-solutions",
    userId: USER_ID.member02,
    title: "Climate Change Solutions",
    userPrompt: "Create a presentation about innovative solutions for climate change",
    language: 0, aspectRatio: 0, slideCount: 5,
    keywords: ["climate", "sustainability", "green", "solutions"],
    visibility: PresentationVisibility.public,
    status: PresentationStatus.draft,
    viewsCount: 0,
  },
] as const;

export async function seedPresentations() {
  await db.insert(presentation).values([...PRESENTATIONS]).onConflictDoNothing();
  console.log("  ✓ presentations");
  await client.end();
}

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { OutlineRepresentation, OutlineType, outline } from "../schema/outline";
import { PRESENTATION_ID } from "./presentations";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const OUTLINE_ID = {
  p1_cover:    "00000006-0000-4000-8000-000000000001",
  p1_agenda:   "00000006-0000-4000-8000-000000000002",
  p1_content1: "00000006-0000-4000-8000-000000000003",
  p1_content2: "00000006-0000-4000-8000-000000000004",
  p1_closing:  "00000006-0000-4000-8000-000000000005",
  p2_cover:    "00000006-0000-4000-8000-000000000006",
  p2_agenda:   "00000006-0000-4000-8000-000000000007",
  p2_content1: "00000006-0000-4000-8000-000000000008",
  p2_content2: "00000006-0000-4000-8000-000000000009",
  p2_closing:  "00000006-0000-4000-8000-000000000010",
  p3_cover:    "00000006-0000-4000-8000-000000000011",
  p3_agenda:   "00000006-0000-4000-8000-000000000012",
  p3_content1: "00000006-0000-4000-8000-000000000013",
  p3_content2: "00000006-0000-4000-8000-000000000014",
  p3_closing:  "00000006-0000-4000-8000-000000000015",
} as const;

export const OUTLINES = [
  { id: OUTLINE_ID.p1_cover,    presentationId: PRESENTATION_ID.p1, order: 0, type: OutlineType.cover,   title: "The Future of AI in Healthcare",        layout: "slide de capa com título principal e subtítulo impactante",                             representation: OutlineRepresentation.auto,        score: 0.95 },
  { id: OUTLINE_ID.p1_agenda,   presentationId: PRESENTATION_ID.p1, order: 1, type: OutlineType.agenda,  title: "Agenda",                                layout: "lista vertical de tópicos da apresentação",                                             representation: OutlineRepresentation.auto,        score: 0.88 },
  { id: OUTLINE_ID.p1_content1, presentationId: PRESENTATION_ID.p1, order: 2, type: OutlineType.content, title: "Current AI Applications in Healthcare", layout: "mapa mental com aplicações de IA irradiando de um conceito central",                    representation: OutlineRepresentation.mindmap,     score: 0.91 },
  { id: OUTLINE_ID.p1_content2, presentationId: PRESENTATION_ID.p1, order: 3, type: OutlineType.content, title: "Future Trends and Predictions",          layout: "dois painéis comparando tendências de curto e longo prazo",                             representation: OutlineRepresentation.timeline,    score: 0.87 },
  { id: OUTLINE_ID.p1_closing,  presentationId: PRESENTATION_ID.p1, order: 4, type: OutlineType.closing, title: "Key Takeaways",                         layout: "lista de conclusões e próximos passos",                                                 representation: OutlineRepresentation.auto,        score: 0.93 },
  { id: OUTLINE_ID.p2_cover,    presentationId: PRESENTATION_ID.p2, order: 0, type: OutlineType.cover,   title: "EduAI — Pitch Deck 2025",               layout: "slide de capa de pitch com nome do produto e tagline",                                  representation: OutlineRepresentation.auto,        score: 0.97 },
  { id: OUTLINE_ID.p2_agenda,   presentationId: PRESENTATION_ID.p2, order: 1, type: OutlineType.agenda,  title: "Agenda",                                layout: "lista numerada dos tópicos do pitch",                                                   representation: OutlineRepresentation.auto,        score: 0.85 },
  { id: OUTLINE_ID.p2_content1, presentationId: PRESENTATION_ID.p2, order: 2, type: OutlineType.content, title: "The Problem",                           layout: "slide de problema com descrição central e pontos de dor destacados",                    representation: OutlineRepresentation.auto,        score: 0.92 },
  { id: OUTLINE_ID.p2_content2, presentationId: PRESENTATION_ID.p2, order: 3, type: OutlineType.content, title: "Our Solution",                          layout: "dois painéis mostrando o fluxo da solução lado a lado com os benefícios",               representation: OutlineRepresentation.flowchart,   score: 0.94 },
  { id: OUTLINE_ID.p2_closing,  presentationId: PRESENTATION_ID.p2, order: 4, type: OutlineType.closing, title: "Investment Ask",                        layout: "slide de fechamento com valor de investimento e retorno esperado em destaque",          representation: OutlineRepresentation.auto,        score: 0.90 },
  { id: OUTLINE_ID.p3_cover,    presentationId: PRESENTATION_ID.p3, order: 0, type: OutlineType.cover,   title: "Climate Change Solutions",              layout: "slide de capa com título e imagem de fundo representando o tema ambiental",            representation: OutlineRepresentation.auto,        score: 0.89 },
  { id: OUTLINE_ID.p3_agenda,   presentationId: PRESENTATION_ID.p3, order: 1, type: OutlineType.agenda,  title: "Agenda",                                layout: "lista de tópicos com ícones representando cada área temática",                          representation: OutlineRepresentation.auto,        score: 0.82 },
  { id: OUTLINE_ID.p3_content1, presentationId: PRESENTATION_ID.p3, order: 2, type: OutlineType.content, title: "Renewable Energy Innovations",          layout: "infográfico com categorias de energia renovável e seus indicadores principais",         representation: OutlineRepresentation.infographic, score: 0.88 },
  { id: OUTLINE_ID.p3_content2, presentationId: PRESENTATION_ID.p3, order: 3, type: OutlineType.content, title: "Carbon Capture Technologies",           layout: "comparação lado a lado de tecnologias de captura de carbono com métricas de eficiência", representation: OutlineRepresentation.auto,       score: 0.86 },
  { id: OUTLINE_ID.p3_closing,  presentationId: PRESENTATION_ID.p3, order: 4, type: OutlineType.closing, title: "Call to Action",                        layout: "slide de chamada para ação com passos claros e mensagem de impacto",                   representation: OutlineRepresentation.auto,        score: 0.91 },
] as const;

export async function seedOutlines() {
  await db.insert(outline).values([...OUTLINES]).onConflictDoNothing();
  console.log("  ✓ outlines");
  await client.end();
}

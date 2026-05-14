import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { permission } from "../schema/permission";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const PERMISSIONS = [
  // presentation
  { id: "10000000-0000-0000-0000-000000000001", key: "presentation:create", description: "Criar apresentação" },
  { id: "10000000-0000-0000-0000-000000000002", key: "presentation:read",   description: "Visualizar apresentação" },
  { id: "10000000-0000-0000-0000-000000000003", key: "presentation:update", description: "Editar apresentação" },
  { id: "10000000-0000-0000-0000-000000000004", key: "presentation:delete", description: "Deletar apresentação" },
  { id: "10000000-0000-0000-0000-000000000005", key: "presentation:share",  description: "Compartilhar apresentação" },
  // outline
  { id: "20000000-0000-0000-0000-000000000001", key: "outline:create", description: "Criar outline" },
  { id: "20000000-0000-0000-0000-000000000002", key: "outline:read",   description: "Visualizar outline" },
  { id: "20000000-0000-0000-0000-000000000003", key: "outline:update", description: "Editar outline" },
  { id: "20000000-0000-0000-0000-000000000004", key: "outline:delete", description: "Deletar outline" },
  // slide
  { id: "30000000-0000-0000-0000-000000000001", key: "slide:create", description: "Criar slide" },
  { id: "30000000-0000-0000-0000-000000000002", key: "slide:read",   description: "Visualizar slide" },
  { id: "30000000-0000-0000-0000-000000000003", key: "slide:update", description: "Editar slide" },
  { id: "30000000-0000-0000-0000-000000000004", key: "slide:delete", description: "Deletar slide" },
  // generation (AI)
  { id: "40000000-0000-0000-0000-000000000001", key: "generation:create", description: "Gerar com IA" },
  { id: "40000000-0000-0000-0000-000000000002", key: "generation:read",   description: "Visualizar gerações" },
  // user management
  { id: "50000000-0000-0000-0000-000000000001", key: "user:read",   description: "Visualizar usuários" },
  { id: "50000000-0000-0000-0000-000000000002", key: "user:update", description: "Editar usuários" },
  { id: "50000000-0000-0000-0000-000000000003", key: "user:delete", description: "Deletar usuários" },
  // group management
  { id: "60000000-0000-0000-0000-000000000001", key: "group:create", description: "Criar grupo" },
  { id: "60000000-0000-0000-0000-000000000002", key: "group:read",   description: "Visualizar grupos" },
  { id: "60000000-0000-0000-0000-000000000003", key: "group:update", description: "Editar grupo" },
  { id: "60000000-0000-0000-0000-000000000004", key: "group:delete", description: "Deletar grupo" },
] as const;

export const PERMISSION_ID = Object.fromEntries(
  PERMISSIONS.map((p) => [p.key, p.id])
) as Record<string, string>;

export async function seedPermissions() {
  await db.insert(permission).values([...PERMISSIONS]).onConflictDoNothing();
  console.log("  ✓ permissions");
  await client.end();
}

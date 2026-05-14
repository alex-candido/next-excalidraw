import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { group } from "../schema/group";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const GROUPS = [
  { id: "00000000-0000-0000-0000-000000000001", name: "admin",  description: "Acesso total ao sistema" },
  { id: "00000000-0000-0000-0000-000000000002", name: "member", description: "Usuário com plano ativo" },
  { id: "00000000-0000-0000-0000-000000000003", name: "guest",  description: "Usuário sem plano" },
  { id: "00000000-0000-0000-0000-000000000004", name: "viewer", description: "Acesso somente leitura" },
] as const;

export const GROUP_ID = {
  admin:  GROUPS[0].id,
  member: GROUPS[1].id,
  guest:  GROUPS[2].id,
  viewer: GROUPS[3].id,
} as const;

export async function seedGroups(createdBy?: string) {
  const values = GROUPS.map((g) => ({ ...g, createdBy: createdBy ?? null }));
  await db.insert(group).values(values).onConflictDoNothing();
  console.log("  ✓ groups");
  await client.end();
}

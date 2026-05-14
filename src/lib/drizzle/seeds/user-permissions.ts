import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { PermissionType, userPermission } from "../schema/user-permission";
import { PERMISSION_ID as P } from "./permissions";
import { USER_ID } from "./users";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const USER_PERMISSIONS = [
  // guest com acesso especial à geração IA
  { id: "00000004-0000-4000-8000-000000000001", userId: USER_ID.guest,    permissionId: P["generation:create"],  type: PermissionType.grant },
  // member02 sem permissão de compartilhar
  { id: "00000004-0000-4000-8000-000000000002", userId: USER_ID.member02, permissionId: P["presentation:share"], type: PermissionType.deny  },
] as const;

export async function seedUserPermissions() {
  await db.insert(userPermission).values([...USER_PERMISSIONS]).onConflictDoNothing();
  console.log("  ✓ user permissions");
  await client.end();
}

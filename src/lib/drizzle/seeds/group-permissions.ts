import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { groupPermission } from "../schema/group-permission";
import { GROUP_ID } from "./groups";
import { PERMISSION_ID as P, PERMISSIONS } from "./permissions";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const GROUP_PERMISSIONS = [
  // admin — tudo
  ...PERMISSIONS.map((p) => ({ groupId: GROUP_ID.admin, permissionId: p.id })),

  // member — presentation, outline, slide, generation
  { groupId: GROUP_ID.member, permissionId: P["presentation:create"] },
  { groupId: GROUP_ID.member, permissionId: P["presentation:read"] },
  { groupId: GROUP_ID.member, permissionId: P["presentation:update"] },
  { groupId: GROUP_ID.member, permissionId: P["presentation:delete"] },
  { groupId: GROUP_ID.member, permissionId: P["presentation:share"] },
  { groupId: GROUP_ID.member, permissionId: P["outline:create"] },
  { groupId: GROUP_ID.member, permissionId: P["outline:read"] },
  { groupId: GROUP_ID.member, permissionId: P["outline:update"] },
  { groupId: GROUP_ID.member, permissionId: P["outline:delete"] },
  { groupId: GROUP_ID.member, permissionId: P["slide:create"] },
  { groupId: GROUP_ID.member, permissionId: P["slide:read"] },
  { groupId: GROUP_ID.member, permissionId: P["slide:update"] },
  { groupId: GROUP_ID.member, permissionId: P["slide:delete"] },
  { groupId: GROUP_ID.member, permissionId: P["generation:create"] },
  { groupId: GROUP_ID.member, permissionId: P["generation:read"] },

  // guest — sem share, sem geração IA
  { groupId: GROUP_ID.guest, permissionId: P["presentation:create"] },
  { groupId: GROUP_ID.guest, permissionId: P["presentation:read"] },
  { groupId: GROUP_ID.guest, permissionId: P["presentation:update"] },
  { groupId: GROUP_ID.guest, permissionId: P["presentation:delete"] },
  { groupId: GROUP_ID.guest, permissionId: P["outline:create"] },
  { groupId: GROUP_ID.guest, permissionId: P["outline:read"] },
  { groupId: GROUP_ID.guest, permissionId: P["outline:update"] },
  { groupId: GROUP_ID.guest, permissionId: P["outline:delete"] },
  { groupId: GROUP_ID.guest, permissionId: P["slide:create"] },
  { groupId: GROUP_ID.guest, permissionId: P["slide:read"] },
  { groupId: GROUP_ID.guest, permissionId: P["slide:update"] },
  { groupId: GROUP_ID.guest, permissionId: P["slide:delete"] },
  { groupId: GROUP_ID.guest, permissionId: P["generation:read"] },

  // viewer — somente leitura
  { groupId: GROUP_ID.viewer, permissionId: P["presentation:read"] },
  { groupId: GROUP_ID.viewer, permissionId: P["outline:read"] },
  { groupId: GROUP_ID.viewer, permissionId: P["slide:read"] },
];

export async function seedGroupPermissions(assignedBy?: string) {
  const values = GROUP_PERMISSIONS.map((gp) => ({ ...gp, assignedBy: assignedBy ?? null }));
  await db.insert(groupPermission).values(values).onConflictDoNothing();
  console.log("  ✓ group permissions");
  await client.end();
}

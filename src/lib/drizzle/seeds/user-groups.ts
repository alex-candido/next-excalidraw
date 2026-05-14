import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { userGroup } from "../schema/user-group";
import { GROUP_ID } from "./groups";
import { USER_ID } from "./users";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export const USER_GROUPS = [
  { id: "00000003-0000-4000-8000-000000000001", userId: USER_ID.admin,    groupId: GROUP_ID.admin,  assignedBy: USER_ID.admin },
  { id: "00000003-0000-4000-8000-000000000002", userId: USER_ID.member01, groupId: GROUP_ID.member, assignedBy: USER_ID.admin },
  { id: "00000003-0000-4000-8000-000000000003", userId: USER_ID.member02, groupId: GROUP_ID.member, assignedBy: USER_ID.admin },
  { id: "00000003-0000-4000-8000-000000000004", userId: USER_ID.guest,    groupId: GROUP_ID.guest,  assignedBy: USER_ID.admin },
  { id: "00000003-0000-4000-8000-000000000005", userId: USER_ID.viewer,   groupId: GROUP_ID.viewer, assignedBy: USER_ID.admin },
] as const;

export async function seedUserGroups() {
  await db.insert(userGroup).values([...USER_GROUPS]).onConflictDoNothing();
  console.log("  ✓ user groups");
  await client.end();
}

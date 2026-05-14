import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { account } from "../schema/account";
import { user } from "../schema/user";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const DEFAULT_PASSWORD = "Dev@1234!";

export const USER_ID = {
  admin:    "00000001-0000-4000-8000-000000000001",
  member01: "00000001-0000-4000-8000-000000000002",
  member02: "00000001-0000-4000-8000-000000000003",
  guest:    "00000001-0000-4000-8000-000000000004",
  viewer:   "00000001-0000-4000-8000-000000000005",
} as const;

export const USERS = [
  { id: USER_ID.admin,    name: "Admin",        email: "admin@dev.local",        emailVerified: true  },
  { id: USER_ID.member01, name: "Ana Silva",     email: "ana.silva@dev.local",    emailVerified: true  },
  { id: USER_ID.member02, name: "Carlos Lima",   email: "carlos.lima@dev.local",  emailVerified: true  },
  { id: USER_ID.guest,    name: "Maria Santos",  email: "maria.santos@dev.local", emailVerified: false },
  { id: USER_ID.viewer,   name: "Pedro Costa",   email: "pedro.costa@dev.local",  emailVerified: false },
] as const;

export async function seedUsers() {
  const passwordHash = await Bun.password.hash(DEFAULT_PASSWORD);

  await db.insert(user).values([...USERS]).onConflictDoNothing();

  const accounts = USERS.map((u, i) => ({
    id: `00000002-0000-4000-8000-00000000000${i + 1}`,
    accountId: u.email,
    providerId: "credential",
    userId: u.id,
    password: passwordHash,
  }));

  await db.insert(account).values(accounts).onConflictDoNothing();

  console.log(`  ✓ users  (password: ${DEFAULT_PASSWORD})`);
  await client.end();
}

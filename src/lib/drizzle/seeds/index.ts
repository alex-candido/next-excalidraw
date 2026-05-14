import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { seed } from "drizzle-seed";
import * as schema from "../schema/auth-schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function main() {
  await seed(db, schema).refine((f) => ({
    user: {
      count: 10,
      columns: {
        id: f.uuid(),
        emailVerified: f.valuesFromArray({ values: [true, false] }),
        role: f.valuesFromArray({ values: [0, 1, 2, 3] }),
        image: f.default({ defaultValue: null }),
      },
    },
    session: {
      count: 10,
      columns: {
        id: f.uuid(),
        token: f.uuid(),
        expiresAt: f.date({ minDate: new Date(), maxDate: new Date("2027-01-01") }),
      },
    },
    account: {
      count: 10,
      columns: {
        id: f.uuid(),
        providerId: f.valuesFromArray({ values: ["google", "email"] }),
        accessToken: f.default({ defaultValue: null }),
        refreshToken: f.default({ defaultValue: null }),
        idToken: f.default({ defaultValue: null }),
        scope: f.default({ defaultValue: null }),
        password: f.default({ defaultValue: null }),
      },
    },
    verification: {
      count: 5,
      columns: {
        id: f.uuid(),
        expiresAt: f.date({ minDate: new Date(), maxDate: new Date("2026-12-31") }),
      },
    },
  }));

  console.log("Seed completed.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { seedGroups } from "./groups";
import { seedPermissions } from "./permissions";
import { seedGroupPermissions } from "./group-permissions";

async function main() {
  console.log("Seeding prod...\n");

  await seedGroups();
  await seedPermissions();
  await seedGroupPermissions();

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

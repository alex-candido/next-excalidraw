import { seedGroups } from "./groups";
import { seedPermissions } from "./permissions";
import { seedGroupPermissions } from "./group-permissions";
import { seedPresentationEntries } from "./presentation-entries";

async function main() {
  console.log("Seeding prod...\n");

  await seedGroups();
  await seedPermissions();
  await seedGroupPermissions();
  await seedPresentationEntries();

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

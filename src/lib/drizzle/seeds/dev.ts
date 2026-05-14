import { seedGroups } from "./groups";
import { seedPermissions } from "./permissions";
import { seedGroupPermissions } from "./group-permissions";
import { seedUsers } from "./users";
import { USER_ID } from "./users";
import { seedUserGroups } from "./user-groups";
import { seedUserPermissions } from "./user-permissions";
import { seedPresentations } from "./presentations";
import { seedOutlines } from "./outlines";
import { seedSlides } from "./slides";
import { seedGenerations } from "./generations";
import { seedLogs } from "./logs";

async function main() {
  console.log("Seeding dev...\n");

  await seedUsers();
  await seedGroups(USER_ID.admin);
  await seedPermissions();
  await seedGroupPermissions(USER_ID.admin);
  await seedUserGroups();
  await seedUserPermissions();
  await seedPresentations();
  await seedOutlines();
  await seedSlides();
  await seedGenerations();
  await seedLogs();

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

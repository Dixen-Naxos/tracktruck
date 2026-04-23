import "dotenv/config";
import { client, connect, disconnect } from "./db/config.js";
import { runSeed } from "./features/seed/runSeed.js";

async function main() {
  await connect();
  console.log("Clearing existing data...");
  const result = await runSeed();
  console.log("Seed complete:");
  console.log(`  ${result.warehouses} warehouses`);
  console.log(`  ${result.stores} stores`);
  console.log(`  ${result.trucks} trucks`);
  console.log(`  ${result.users} users`);
  console.log(`  ${result.deliveries} deliveries`);
  console.log(`  ${result.truckPositionTraces} truck position traces`);
  await disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await client.close().catch(() => {});
  process.exit(1);
});

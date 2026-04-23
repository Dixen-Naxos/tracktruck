import "dotenv/config";
import { ObjectId } from "mongodb";
import { client, connect, disconnect, db } from "./db/config.js";
import { stores } from "./db/Store.js";
import { warehouses } from "./db/Warehouse.js";
import { trucks } from "./db/Truck.js";
import { users } from "./db/User.js";
import { deliveries } from "./db/Delivery.js";
import { dashcamVideos } from "./db/DashcamVideo.js";
import { truckPositionTraces } from "./db/TruckPositionTrace.js";

async function clearAll() {
  await Promise.all([
    stores.deleteMany({}),
    warehouses.deleteMany({}),
    trucks.deleteMany({}),
    users.deleteMany({}),
    deliveries.deleteMany({}),
    dashcamVideos.deleteMany({}),
    truckPositionTraces.deleteMany({}),
  ]);
}

async function seed() {
  await connect();
  console.log("Clearing existing data...");
  await clearAll();

  // --- Warehouses ---
  const warehouseDocs = [
    { _id: new ObjectId(), name: "Entrepôt Paris Nord", address: "12 Rue de la Logistique, 93200 Saint-Denis" },
    { _id: new ObjectId(), name: "Entrepôt Lyon Sud", address: "45 Avenue des Transports, 69007 Lyon" },
    { _id: new ObjectId(), name: "Entrepôt Marseille", address: "8 Boulevard du Port, 13002 Marseille" },
  ];
  await warehouses.insertMany(warehouseDocs);

  // --- Stores ---
  const storeDocs = [
    { _id: new ObjectId(), name: "Supérette Bastille", address: "3 Place de la Bastille, 75011 Paris" },
    { _id: new ObjectId(), name: "Supérette Montmartre", address: "22 Rue des Abbesses, 75018 Paris" },
    { _id: new ObjectId(), name: "Supérette République", address: "10 Place de la République, 75003 Paris" },
    { _id: new ObjectId(), name: "Supérette Part-Dieu", address: "5 Rue Garibaldi, 69003 Lyon" },
    { _id: new ObjectId(), name: "Supérette Vieux-Port", address: "1 Quai du Port, 13002 Marseille" },
    { _id: new ObjectId(), name: "Supérette Canebière", address: "50 La Canebière, 13001 Marseille" },
  ];
  await stores.insertMany(storeDocs);

  // --- Trucks ---
  const truckDocs = [
    { _id: new ObjectId(), plateNumber: "AB-123-CD", packageCapacity: 120 },
    { _id: new ObjectId(), plateNumber: "EF-456-GH", packageCapacity: 80 },
    { _id: new ObjectId(), plateNumber: "IJ-789-KL", packageCapacity: 200 },
  ];
  await trucks.insertMany(truckDocs);

  // --- Users ---
  const userDocs = [
    {
      _id: new ObjectId(),
      firebaseUid: "seed-admin-1",
      email: "admin@tracktruck.dev",
      role: "admin" as const,
    },
    {
      _id: new ObjectId(),
      firebaseUid: "seed-driver-1",
      email: "driver1@tracktruck.dev",
      role: "driver" as const,
      firstName: "Alice",
      lastName: "Martin",
    },
    {
      _id: new ObjectId(),
      firebaseUid: "seed-driver-2",
      email: "driver2@tracktruck.dev",
      role: "driver" as const,
      firstName: "Bob",
      lastName: "Durand",
    },
    {
      _id: new ObjectId(),
      firebaseUid: "seed-driver-3",
      email: "driver3@tracktruck.dev",
      role: "driver" as const,
      firstName: "Chloé",
      lastName: "Dubois",
    },
  ];
  await users.insertMany(userDocs);

  // --- Deliveries ---
  const now = Date.now();
  const hours = (h: number) => new Date(now + h * 3600_000);

  const deliveryDocs = [
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[0]._id,
      storeIds: [storeDocs[0]._id, storeDocs[1]._id, storeDocs[2]._id],
      plannedStartAt: hours(24),
      storeArrivals: [],
      status: "planned" as const,
    },
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[1]._id,
      storeIds: [storeDocs[3]._id],
      plannedStartAt: hours(-2),
      actualStartAt: hours(-1.5),
      storeArrivals: [],
      status: "started" as const,
      itinerary: [
        {
          start: { lat: 45.7485, lng: 4.8467 },
          end: { lat: 45.7606, lng: 4.8547 },
        },
      ],
    },
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[2]._id,
      storeIds: [storeDocs[4]._id, storeDocs[5]._id],
      plannedStartAt: hours(-48),
      actualStartAt: hours(-47),
      storeArrivals: [
        { storeId: storeDocs[4]._id, arrivedAt: hours(-46) },
        { storeId: storeDocs[5]._id, arrivedAt: hours(-45) },
      ],
      status: "done" as const,
    },
  ];
  await deliveries.insertMany(deliveryDocs);

  // --- Truck position traces (for the started delivery) ---
  const startedDelivery = deliveryDocs[1];
  const movingTruck = truckDocs[1];
  const traceDocs = Array.from({ length: 5 }, (_, i) => ({
    _id: new ObjectId(),
    truckId: movingTruck._id,
    deliveryId: startedDelivery._id,
    position: {
      lat: 45.7485 + i * 0.0025,
      lng: 4.8467 + i * 0.002,
    },
    timestamp: new Date(now - (5 - i) * 60_000),
  }));
  await truckPositionTraces.insertMany(traceDocs);

  console.log("Seed complete:");
  console.log(`  ${warehouseDocs.length} warehouses`);
  console.log(`  ${storeDocs.length} stores`);
  console.log(`  ${truckDocs.length} trucks`);
  console.log(`  ${userDocs.length} users`);
  console.log(`  ${deliveryDocs.length} deliveries`);
  console.log(`  ${traceDocs.length} truck position traces`);

  await disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await client.close().catch(() => {});
  process.exit(1);
});

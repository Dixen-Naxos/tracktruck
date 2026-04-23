import "dotenv/config";
import { ObjectId } from "mongodb";
import { client, connect, disconnect } from "./db/config.js";
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
    {
      _id: new ObjectId(),
      name: "Entrepôt Paris Nord",
      address: "50 Avenue du Président Wilson, 93210 Saint-Denis",
      location: { lat: 48.917, lng: 2.36 },
    },
    {
      _id: new ObjectId(),
      name: "Entrepôt Lyon Sud",
      address: "112 Avenue Jean Jaurès, 69007 Lyon",
      location: { lat: 45.733, lng: 4.835 },
    },
    {
      _id: new ObjectId(),
      name: "Entrepôt Marseille",
      address: "23 Rue Mazenod, 13002 Marseille",
      location: { lat: 43.302, lng: 5.37 },
    },
  ];
  await warehouses.insertMany(warehouseDocs);

  // --- Stores ---
  const storeDocs = [
    {
      _id: new ObjectId(),
      name: "Supérette Bastille",
      address: "5 Place de la Bastille, 75004 Paris",
      location: { lat: 48.853, lng: 2.369 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette Montmartre",
      address: "30 Rue des Abbesses, 75018 Paris",
      location: { lat: 48.884, lng: 2.338 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette République",
      address: "16 Place de la République, 75010 Paris",
      location: { lat: 48.867, lng: 2.363 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette Part-Dieu",
      address: "17 Rue Garibaldi, 69003 Lyon",
      location: { lat: 45.761, lng: 4.859 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette Vieux-Port",
      address: "2 Quai du Port, 13002 Marseille",
      location: { lat: 43.296, lng: 5.37 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette Canebière",
      address: "80 La Canebière, 13001 Marseille",
      location: { lat: 43.2965, lng: 5.379 },
    },
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
    // Planned – tournée Paris depuis Saint-Denis (optimisée : Bastille → République → Montmartre)
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[0]._id,
      storeIds: [storeDocs[0]._id, storeDocs[2]._id, storeDocs[1]._id],
      totalDistanceKm: 38.4,
      totalDurationSeconds: 5040, // ~1h24
      plannedStartAt: hours(24),
      storeArrivals: [],
      status: "planned" as const,
      itinerary: [
        { start: { lat: 48.917, lng: 2.36 },  end: { lat: 48.853, lng: 2.369 } }, // Saint-Denis → Bastille
        { start: { lat: 48.853, lng: 2.369 }, end: { lat: 48.867, lng: 2.363 } }, // Bastille → République
        { start: { lat: 48.867, lng: 2.363 }, end: { lat: 48.884, lng: 2.338 } }, // République → Montmartre
      ],
    },

    // Started – tournée Lyon depuis entrepôt Jean Jaurès
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[1]._id,
      storeIds: [storeDocs[3]._id],
      totalDistanceKm: 4.2,
      totalDurationSeconds: 900, // ~15min
      plannedStartAt: hours(-2),
      actualStartAt: hours(-1.5),
      storeArrivals: [],
      status: "started" as const,
      itinerary: [
        { start: { lat: 45.733, lng: 4.835 }, end: { lat: 45.761, lng: 4.859 } }, // Jean Jaurès → Part-Dieu
      ],
    },

    // Done – tournée Marseille depuis entrepôt Mazenod
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[2]._id,
      storeIds: [storeDocs[4]._id, storeDocs[5]._id],
      totalDistanceKm: 5.8,
      totalDurationSeconds: 1200, // ~20min
      plannedStartAt: hours(-48),
      actualStartAt: hours(-47),
      storeArrivals: [
        { storeId: storeDocs[4]._id, arrivedAt: hours(-46.5) },
        { storeId: storeDocs[5]._id, arrivedAt: hours(-46) },
      ],
      status: "done" as const,
      itinerary: [
        { start: { lat: 43.302, lng: 5.37 },  end: { lat: 43.296, lng: 5.37 } },  // Mazenod → Vieux-Port
        { start: { lat: 43.296, lng: 5.37 },  end: { lat: 43.2965, lng: 5.379 } }, // Vieux-Port → Canebière
      ],
    },
  ];
  await deliveries.insertMany(deliveryDocs);

  // --- Truck position traces (Lyon delivery) ---
  const startedDelivery = deliveryDocs[1];
  const movingTruck = truckDocs[1];

  const baseLat = warehouseDocs[1].location.lat;
  const baseLng = warehouseDocs[1].location.lng;

  const traceDocs = Array.from({ length: 6 }, (_, i) => ({
    _id: new ObjectId(),
    truckId: movingTruck._id,
    deliveryId: startedDelivery._id,
    position: {
      lat: baseLat + i * 0.002,
      lng: baseLng + i * 0.002,
    },
    timestamp: new Date(now - (6 - i) * 60_000),
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
import { ObjectId } from "mongodb";
import { stores } from "../../db/Store.js";
import { warehouses } from "../../db/Warehouse.js";
import { trucks } from "../../db/Truck.js";
import { users } from "../../db/User.js";
import { deliveries } from "../../db/Delivery.js";
import { dashcamVideos } from "../../db/DashcamVideo.js";
import {
  truckPositionTraces,
  type TruckPositionTrace,
} from "../../db/TruckPositionTrace.js";

export async function clearAll() {
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

export type SeedResult = {
  warehouses: number;
  stores: number;
  trucks: number;
  users: number;
  deliveries: number;
  truckPositionTraces: number;
};

export async function runSeed(): Promise<SeedResult> {
  await clearAll();

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

  const truckDocs = [
    { _id: new ObjectId(), plateNumber: "AB-123-CD", packageCapacity: 120, fuelType: "diesel" as const, fuelConsumptionL100km: 28.5 },
    { _id: new ObjectId(), plateNumber: "EF-456-GH", packageCapacity: 80,  fuelType: "diesel" as const, fuelConsumptionL100km: 24.0 },
    { _id: new ObjectId(), plateNumber: "IJ-789-KL", packageCapacity: 200, fuelType: "essence" as const, fuelConsumptionL100km: 18.5 },
  ];
  await trucks.insertMany(truckDocs);

  const adminDocs = [
    {
      _id: new ObjectId(),
      firebaseUid: "n8lklkfbdBRLR5J0h2FooZ2KhEr2",
      email: "basile.paoli@gmail.com",
      role: "admin" as const,
    },
    {
      _id: new ObjectId(),
      firebaseUid: "seed-admin-1",
      email: "admin@tracktruck.dev",
      role: "admin" as const,
    },
    {
      _id: new ObjectId(),
      firebaseUid: "seed-admin-2",
      email: "marie.lefevre@tracktruck.dev",
      role: "admin" as const,
    },
  ];

  const allSkills = ["frigorifique", "matières dangereuses", "fragile", "longue distance", "express"];
  const allZones = ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille", "Toulouse", "Nantes"];
  const pick = <T,>(arr: T[], n: number, seed: number): T[] => {
    const out: T[] = [];
    for (let i = 0; i < n; i++) out.push(arr[(seed + i * 3) % arr.length]);
    return Array.from(new Set(out));
  };
  const phone = (i: number) =>
    `+33 6 ${String(10 + i).padStart(2, "0")} ${String(20 + i).padStart(2, "0")} ${String(30 + i).padStart(2, "0")} ${String(40 + i).padStart(2, "0")}`;

  const driverDocs = [
    {
      _id: new ObjectId(),
      firebaseUid: "J0BZh0OgspX6Vyd6o8aE8aGzOqB2",
      email: "armanddailly@gmail.com",
      role: "driver" as const,
      firstName: "Armand",
      lastName: "Dailly",
      phone: "+33 6 00 00 00 00",
      skills: ["frigorifique", "express"],
      zones: ["Paris", "Lille"],
    },
    ...[
      ["Alice", "Martin"],
      ["Bob", "Durand"],
      ["Chloé", "Dubois"],
      ["David", "Bernard"],
      ["Emma", "Petit"],
      ["Florian", "Robert"],
      ["Gaëlle", "Richard"],
      ["Hugo", "Moreau"],
      ["Inès", "Laurent"],
      ["Julien", "Simon"],
      ["Karim", "Michel"],
      ["Léa", "Garcia"],
      ["Mathieu", "David"],
      ["Nadia", "Bertrand"],
      ["Olivier", "Roux"],
      ["Pauline", "Vincent"],
      ["Quentin", "Fournier"],
      ["Romain", "Morel"],
      ["Sophie", "Girard"],
      ["Thomas", "Andre"],
    ].map(([firstName, lastName], i) => ({
      _id: new ObjectId(),
      firebaseUid: `seed-driver-${i + 1}`,
      email: `${firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${lastName.toLowerCase()}@tracktruck.dev`,
      role: "driver" as const,
      firstName,
      lastName,
      phone: phone(i),
      skills: pick(allSkills, 1 + (i % 3), i),
      zones: pick(allZones, 1 + (i % 2), i + 1),
    })),
  ];

  const userDocs = [...adminDocs, ...driverDocs];
  await users.insertMany(userDocs);

  const now = Date.now();
  const hours = (h: number) => new Date(now + h * 3600_000);

  const deliveryDocs = [
    // Paris — planned for tomorrow, not yet started.
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[0]._id,
      storeIds: [storeDocs[0]._id, storeDocs[2]._id, storeDocs[1]._id],
      totalDistanceKm: 38.4,
      totalDurationSeconds: 5040,
      plannedStartAt: hours(24),
      storeArrivals: [],
      status: "planned" as const,
      truckId: truckDocs[0]._id,
      driverId: driverDocs[3]._id,
    },
    // Lyon — currently in progress, no stop arrived yet.
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[1]._id,
      storeIds: [storeDocs[3]._id],
      totalDistanceKm: 4.2,
      totalDurationSeconds: 900,
      plannedStartAt: hours(-2),
      actualStartAt: hours(-1.5),
      storeArrivals: [],
      status: "started" as const,
      truckId: truckDocs[1]._id,
      driverId: driverDocs[0]._id,
    },
    // Marseille — in progress, first stop done, second pending.
    {
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[2]._id,
      storeIds: [storeDocs[4]._id, storeDocs[5]._id],
      totalDistanceKm: 5.8,
      totalDurationSeconds: 1200,
      plannedStartAt: hours(-3),
      actualStartAt: hours(-2.5),
      storeArrivals: [
        { storeId: storeDocs[4]._id, arrivedAt: hours(-1) },
      ],
      status: "started" as const,
      truckId: truckDocs[2]._id,
      driverId: driverDocs[2]._id,
    },
  ];
  await deliveries.insertMany(deliveryDocs);

  // Lay down a trail of positions for each in-progress driver, walking from
  // the departure warehouse towards their current neighborhood.
  const trailFor = (
    driverId: ObjectId,
    deliveryId: ObjectId,
    baseLat: number,
    baseLng: number,
    dLat: number,
    dLng: number,
    count: number,
  ): TruckPositionTrace[] =>
    Array.from({ length: count }, (_, i) => ({
      _id: new ObjectId(),
      driverId,
      deliveryId,
      position: {
        lat: baseLat + i * dLat,
        lng: baseLng + i * dLng,
      },
      timestamp: new Date(now - (count - i) * 60_000),
    }));

  const lyonDelivery = deliveryDocs[1];
  const marseilleDelivery = deliveryDocs[2];

  const traceDocs: TruckPositionTrace[] = [
    ...trailFor(
      driverDocs[0]._id,
      lyonDelivery._id,
      warehouseDocs[1].location.lat,
      warehouseDocs[1].location.lng,
      0.002,
      0.002,
      6,
    ),
    ...trailFor(
      driverDocs[2]._id,
      marseilleDelivery._id,
      warehouseDocs[2].location.lat,
      warehouseDocs[2].location.lng,
      -0.001,
      0.0015,
      6,
    ),
  ];
  await truckPositionTraces.insertMany(traceDocs);

  return {
    warehouses: warehouseDocs.length,
    stores: storeDocs.length,
    trucks: truckDocs.length,
    users: userDocs.length,
    deliveries: deliveryDocs.length,
    truckPositionTraces: traceDocs.length,
  };
}

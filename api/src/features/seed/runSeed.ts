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
      name: "Entrepôt Paris Est",
      address: "12 Rue du Faubourg Saint-Antoine, 75012 Paris",
      location: { lat: 48.852, lng: 2.373 },
    },
    {
      _id: new ObjectId(),
      name: "Entrepôt Paris Ouest",
      address: "8 Rue de la Garenne, 92000 Nanterre",
      location: { lat: 48.893, lng: 2.207 },
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
      name: "Supérette Nation",
      address: "1 Place de la Nation, 75011 Paris",
      location: { lat: 48.848, lng: 2.396 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette Vincennes",
      address: "42 Rue de Fontenay, 94300 Vincennes",
      location: { lat: 48.847, lng: 2.439 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette Saint-Denis Centre",
      address: "3 Rue de la République, 93200 Saint-Denis",
      location: { lat: 48.936, lng: 2.357 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette Pantin",
      address: "18 Avenue Jean Lolive, 93500 Pantin",
      location: { lat: 48.899, lng: 2.407 },
    },
    {
      _id: new ObjectId(),
      name: "Supérette Créteil",
      address: "10 Rue Juliette Récamier, 94000 Créteil",
      location: { lat: 48.777, lng: 2.457 },
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
  const allZones = ["Paris", "Seine-Saint-Denis", "Val-de-Marne", "Hauts-de-Seine", "Val-d'Oise", "Essonne", "Seine-et-Marne", "Yvelines"];
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
    {
      // Paris Nord → Bastille, République, Montmartre (planned)
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[0]._id,
      storeIds: [storeDocs[0]._id, storeDocs[2]._id, storeDocs[1]._id],
      totalDistanceKm: 18.3,
      totalDurationSeconds: 3240,
      plannedStartAt: hours(24),
      storeArrivals: [],
      status: "planned" as const,
      roadSignIds: [],
      wasRerouted: false,
      driverId: driverDocs[3]._id,
      truckId: truckDocs[0]._id,
    },
    {
      // Paris Est → Nation, Vincennes (started)
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[1]._id,
      storeIds: [storeDocs[3]._id, storeDocs[4]._id],
      totalDistanceKm: 7.6,
      totalDurationSeconds: 1440,
      plannedStartAt: hours(-2),
      actualStartAt: hours(-1.5),
      storeArrivals: [],
      status: "started" as const,
      roadSignIds: [],
      wasRerouted: false,
      driverId: driverDocs[0]._id,
      truckId: truckDocs[1]._id,
    },
    {
      // Paris Ouest → Pantin, Saint-Denis (done)
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[2]._id,
      storeIds: [storeDocs[6]._id, storeDocs[5]._id],
      totalDistanceKm: 22.1,
      totalDurationSeconds: 4200,
      plannedStartAt: hours(-48),
      actualStartAt: hours(-47),
      storeArrivals: [
        { storeId: storeDocs[6]._id, arrivedAt: hours(-46.5) },
        { storeId: storeDocs[5]._id, arrivedAt: hours(-46) },
      ],
      status: "done" as const,
      roadSignIds: [],
      wasRerouted: false,
      driverId: driverDocs[2]._id,
      truckId: truckDocs[2]._id,
    },
    {
      // Paris Nord → Créteil, Nation (planned demain matin)
      _id: new ObjectId(),
      departureWarehouseId: warehouseDocs[0]._id,
      storeIds: [storeDocs[7]._id, storeDocs[3]._id],
      totalDistanceKm: 31.4,
      totalDurationSeconds: 5400,
      plannedStartAt: hours(48),
      storeArrivals: [],
      status: "planned" as const,
      roadSignIds: [],
      wasRerouted: false,
      driverId: driverDocs[1]._id,
      truckId: truckDocs[0]._id,
    },
  ];
  await deliveries.insertMany(deliveryDocs);

  const startedDelivery = deliveryDocs[1];
  const movingDriver = driverDocs[0];
  // La livraison en cours part de Paris Est, en direction de Nation
  const baseLat = warehouseDocs[1].location.lat;
  const baseLng = warehouseDocs[1].location.lng;

  const traceDocs: TruckPositionTrace[] = Array.from({ length: 6 }, (_, i) => ({
    _id: new ObjectId(),
    driverId: movingDriver._id,
    deliveryId: startedDelivery._id,
    position: {
      lat: baseLat + i * 0.002,
      lng: baseLng + i * 0.002,
    },
    timestamp: new Date(now - (6 - i) * 60_000),
  }));
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

import type { ObjectId } from "mongodb";
import { trucks, type Truck } from "../../db/Truck.js";
import { deliveries, type Delivery } from "../../db/Delivery.js";
import { warehouses, type Warehouse } from "../../db/Warehouse.js";
import { stores, type Store } from "../../db/Store.js";
import { users, type DriverUser } from "../../db/User.js";
import {
  truckPositionTraces,
  type TruckPositionTrace,
} from "../../db/TruckPositionTrace.js";

export type EnrichedDriver = Pick<
  DriverUser,
  "_id" | "firstName" | "lastName" | "phone" | "email"
>;

export type EnrichedStopArrival = {
  _id: ObjectId;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  arrivedAt: Date | null;
};

export type EnrichedDelivery = {
  _id: ObjectId;
  status: Delivery["status"];
  plannedStartAt: Date;
  actualStartAt: Date | null;
  totalDistanceKm: number;
  totalDurationSeconds: number;
  departureWarehouse: Pick<
    Warehouse,
    "_id" | "name" | "address" | "location"
  > | null;
  stops: EnrichedStopArrival[];
};

export type TruckListItem = Truck & {
  driver: EnrichedDriver | null;
  currentDelivery: EnrichedDelivery | null;
  currentPosition: {
    lat: number;
    lng: number;
    timestamp: Date;
  } | null;
};

/**
 * Picks the "current" delivery for a truck: prefer status=started, fall back
 * to the next planned one (earliest plannedStartAt). Done deliveries are
 * ignored.
 */
function pickCurrentDelivery(list: Delivery[]): Delivery | null {
  const started = list.find((d) => d.status === "started");
  if (started) return started;

  const planned = list
    .filter((d) => d.status === "planned")
    .sort((a, b) => a.plannedStartAt.getTime() - b.plannedStartAt.getTime());

  return planned[0] ?? null;
}

async function enrichTruck(truck: Truck): Promise<TruckListItem> {
  const truckDeliveries = await deliveries
    .find({ truckId: truck._id, status: { $in: ["started", "planned"] } })
    .toArray();

  const delivery = pickCurrentDelivery(truckDeliveries);

  let driver: EnrichedDriver | null = null;
  if (delivery?.driverId) {
    const u = (await users.findOne({
      _id: delivery.driverId,
      role: "driver",
    })) as DriverUser | null;
    if (u) {
      driver = {
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        email: u.email,
      };
    }
  }

  let enrichedDelivery: EnrichedDelivery | null = null;
  if (delivery) {
    const warehouse = await warehouses.findOne({
      _id: delivery.departureWarehouseId,
    });

    const stopDocs = delivery.storeIds.length
      ? await stores
          .find({ _id: { $in: delivery.storeIds } })
          .toArray()
      : ([] as Store[]);

    const byId = new Map(stopDocs.map((s) => [s._id.toHexString(), s]));
    const arrivalById = new Map(
      delivery.storeArrivals.map((a) => [a.storeId.toHexString(), a.arrivedAt]),
    );

    const stops: EnrichedStopArrival[] = delivery.storeIds
      .map((id) => {
        const s = byId.get(id.toHexString());
        if (!s) return null;
        return {
          _id: s._id,
          name: s.name,
          address: s.address,
          location: s.location,
          arrivedAt: arrivalById.get(s._id.toHexString()) ?? null,
        } satisfies EnrichedStopArrival;
      })
      .filter((v): v is EnrichedStopArrival => v !== null);

    enrichedDelivery = {
      _id: delivery._id,
      status: delivery.status,
      plannedStartAt: delivery.plannedStartAt,
      actualStartAt: delivery.actualStartAt ?? null,
      totalDistanceKm: delivery.totalDistanceKm,
      totalDurationSeconds: delivery.totalDurationSeconds,
      departureWarehouse: warehouse
        ? {
            _id: warehouse._id,
            name: warehouse.name,
            address: warehouse.address,
            location: warehouse.location,
          }
        : null,
      stops,
    };
  }

  let currentPosition: TruckListItem["currentPosition"] = null;
  if (delivery?.driverId) {
    const trace = (await truckPositionTraces.findOne(
      { driverId: delivery.driverId },
      { sort: { timestamp: -1 } },
    )) as TruckPositionTrace | null;
    if (trace) {
      currentPosition = {
        lat: trace.position.lat,
        lng: trace.position.lng,
        timestamp: trace.timestamp,
      };
    }
  }

  return {
    ...truck,
    driver,
    currentDelivery: enrichedDelivery,
    currentPosition,
  };
}

export async function listTrucks(): Promise<TruckListItem[]> {
  const all = await trucks.find({}).toArray();
  return Promise.all(all.map(enrichTruck));
}

export { enrichTruck };
